import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {documentsApi} from '../services/documentsApi';
import type {DocListParams} from '../types/document.types';

/**
 * Hook for fetching document list
 */
export const useDocList = (params: DocListParams) => {
  return useQuery({
    queryKey: ['docList', params],
    queryFn: () => documentsApi.getDocList(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for fetching document detail
 */
export const useDocDetail = (noLot: string, noOrd712: string, noDep: string, docType: string) => {
  return useQuery({
    queryKey: ['docDetail', noLot, noOrd712, noDep, docType],
    queryFn: () => documentsApi.getDocDetail(noLot, noOrd712, noDep, docType),
    enabled: !!noLot && !!noOrd712 && !!docType,
  });
};

/**
 * Hook for fetching today's documents
 */
export const useDocsToday = (docType: number) => {
  return useQuery({
    queryKey: ['docsToday', docType],
    queryFn: () => documentsApi.getDocsToday(docType),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook for saving document (master + details)
 * Uses 2-step process: insertDocMaster then insertDocDetail
 */
export const useSaveDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      noOrd: string;
      noOrd712: string;
      noLot: string;
      noDep: string;
      noDepTo: string;
      noPrd: string;
      docType: string;
      details: Array<{noCol: string; quantity: number}>;
    }) => documentsApi.saveDocument(params),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({queryKey: ['docDetail']});
      queryClient.invalidateQueries({queryKey: ['docList']});
      queryClient.invalidateQueries({queryKey: ['docsToday']});
      queryClient.invalidateQueries({queryKey: ['homeInfo']});
    },
  });
};
