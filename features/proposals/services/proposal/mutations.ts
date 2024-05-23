import { queryClient } from "@/utils/query-client";
import { proposalService } from "./proposal-service";
import { proposalKeys } from "./query-options";
import { type IVoteParams } from "./params";

export function castVoteMutation(params: IVoteParams) {
  const { proposalId, stage } = params;

  return {
    mutateFunction: proposalService.castVote,
    onSettled: () => {
      // invalidate the query for all the votes of the proposal being voted on
      queryClient.invalidateQueries({ queryKey: proposalKeys.votes({ proposalId, stage }) });

      // invalidate the query for the proposal being voted on
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail({ proposalId }) });
    },
  };
}
