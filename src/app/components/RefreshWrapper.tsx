// 'use client'
// import PullToRefresh from 'react-simple-pull-to-refresh'
// import { useQueryClient } from '@tanstack/react-query'
// import React from 'react'

// type Props = {
//     children: React.ReactNode
// }

// export default function RefreshWrapper({ children }: Props) {
//     const queryClient = useQueryClient()

//     const handleRefresh = async () => {
//         await queryClient.invalidateQueries()
//     }

//     return (
//         <PullToRefresh onRefresh={handleRefresh}>
//             {children}
//         </PullToRefresh>
//     )
// }
"use client";
import PullToRefresh from "react-simple-pull-to-refresh";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

type Props = {
  children: React.ReactNode;
  queryKeys?: any[];
  onRefreshExtra?: () => Promise<void> | void;
};

export default function RefreshWrapper({
  children,
  queryKeys = [],
  onRefreshExtra,
}: Props) {
  const queryClient = useQueryClient();

  //   const handleRefresh = async () => {
  //     // Refresh only specific queries
  //     if (queryKeys.length > 0) {
  //       await Promise.all(
  //         queryKeys.map((key) =>
  //           queryClient.invalidateQueries({ queryKey: key }),
  //         ),
  //       );
  //     }

  //     // Run extra logic (e.g. reshuffle)
  //     if (onRefreshExtra) {
  //       await onRefreshExtra();
  //     }
  //   };
  const handleRefresh = async () => {
    if (onRefreshExtra) {
      await onRefreshExtra();
    }
  };

  return <PullToRefresh onRefresh={handleRefresh}>{children}</PullToRefresh>;
}
