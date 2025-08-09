import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { QueryKeys } from '@/types/api';
import { showError, showSuccess, logError } from '@/utils/error-handler';
import type { AuthUser, Profile, SchoolVerification } from '@/types';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // 현재 사용자 정보 가져오기
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: QueryKeys.user,
    queryFn: async (): Promise<AuthUser | null> => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          return null;
        }

        // 프로필 정보 가져오기
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          logError(profileError, 'Profile fetch error');
        }

        // 학교 인증 정보 가져오기 (인증된 사용자만)
        let schoolVerification = null;
        try {
          const { data: verification, error: verificationError } = await supabase
            .from('school_verifications')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'verified')
            .single();

          if (verificationError && verificationError.code !== 'PGRST116') {
            logError(verificationError, 'School verification fetch error');
          } else if (verification) {
            schoolVerification = verification;
          }
        } catch (error) {
          // 학교 인증 정보 조회 실패는 조용히 처리
          logError(error, 'School verification fetch unexpected error');
        }

        return {
          id: user.id,
          email: user.email || '',
          profile: profile || null,
          school_verification: schoolVerification,
        };
      } catch (error) {
        logError(error, 'User fetch error');
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: (failureCount, error: any) => {
      // 인증 관련 에러는 재시도하지 않음
      if (error?.status === 401 || error?.status === 403 || error?.status === 406) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // 로그인 뮤테이션
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.user });
      showSuccess('로그인되었습니다.');
    },
    onError: (error: any) => {
      showError(error, '로그인에 실패했습니다.');
    },
  });

  // 회원가입 뮤테이션
  const signUpMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      showSuccess('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
    },
    onError: (error: any) => {
      showError(error, '회원가입에 실패했습니다.');
    },
  });

  // 로그아웃 뮤테이션
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.clear(); // 모든 캐시 클리어
      showSuccess('로그아웃되었습니다.');
    },
    onError: (error: any) => {
      showError(error, '로그아웃에 실패했습니다.');
    },
  });

  // 프로필 업데이트 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<Profile>) => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.user });
      showSuccess('프로필이 업데이트되었습니다.');
    },
    onError: (error: any) => {
      showError(error, '프로필 업데이트에 실패했습니다.');
    },
  });

  // 인증 상태 실시간 구독
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          queryClient.invalidateQueries({ queryKey: QueryKeys.user });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient, supabase.auth]);

  // 권한 체크 헬퍼 함수들
  const isAuthenticated = !!user;
  const isSchoolVerified = !!user?.school_verification;
  const hasProfile = !!user?.profile;

  // 특정 학교 인증 체크
  const isVerifiedForSchool = (schoolId: number) => {
    return user?.school_verification?.school_id === schoolId;
  };

  // 카테고리 접근 권한 체크
  const canAccessCategory = (category: { requires_auth: boolean; parent_id: number | null; id: number }) => {
    // 인증이 필요하지 않은 카테고리
    if (!category.requires_auth) {
      return true;
    }

    // 로그인하지 않은 경우
    if (!isAuthenticated) {
      return false;
    }

    // 학교 게시판인 경우 (parent_id가 2)
    if (category.parent_id === 2) {
      return isVerifiedForSchool(category.id);
    }

    return true;
  };

  return {
    // 상태
    user,
    isLoading: userLoading,
    error: userError,
    isAuthenticated,
    isSchoolVerified,
    hasProfile,

    // 액션
    login: loginMutation.mutate,
    signUp: signUpMutation.mutate,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,

    // 로딩 상태
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,

    // 헬퍼 함수
    isVerifiedForSchool,
    canAccessCategory,
  };
} 