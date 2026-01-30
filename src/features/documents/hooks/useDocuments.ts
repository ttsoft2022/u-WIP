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
export const useDocDetail = (noLot: string, noOrd: string, docType: string) => {
  return useQuery({
    queryKey: ['docDetail', noLot, noOrd, docType],
    queryFn: () => documentsApi.getDocDetail(noLot, noOrd, docType),
    enabled: !!noLot && !!noOrd && !!docType,
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
 * Hook for updating document detail
 */
export const useUpdateDocDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noLot,
      noOrd,
      docType,
      details,
    }: {
      noLot: string;
      noOrd: string;
      docType: string;
      details: Array<{noSize: string; noColor: string; qty: number}>;
    }) => documentsApi.updateDocDetail(noLot, noOrd, docType, details),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({queryKey: ['docDetail', variables.noLot, variables.noOrd]});
      queryClient.invalidateQueries({queryKey: ['docList']});
      queryClient.invalidateQueries({queryKey: ['docsToday']});
      queryClient.invalidateQueries({queryKey: ['homeInfo']});
    },
  });
};
