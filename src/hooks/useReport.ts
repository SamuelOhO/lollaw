import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CreateReportDto, Report } from '@/types/report';
import { toast } from 'react-hot-toast';

export const useReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const createReport = async (reportData: CreateReportDto): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('reports')
        .insert([reportData]);

      if (error) {
        console.error('신고 처리 중 오류:', error);
        toast.error('신고 처리 중 오류가 발생했습니다.');
        return false;
      }

      toast.success('신고가 접수되었습니다.');
      return true;
    } catch (error) {
      console.error('신고 처리 중 오류:', error);
      toast.error('신고 처리 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserReports = async (): Promise<Report[]> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('신고 목록 조회 중 오류:', error);
        toast.error('신고 목록을 불러오는 중 오류가 발생했습니다.');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('신고 목록 조회 중 오류:', error);
      toast.error('신고 목록을 불러오는 중 오류가 발생했습니다.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createReport,
    getUserReports,
    isLoading
  };
}; 