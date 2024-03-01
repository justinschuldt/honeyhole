"use client";

import { gql, useQuery } from "@apollo/client";

const PotsTable = () => {
  const POTS_GRAPHQL = `
  {
    pots(first: 25, orderBy: createdAt, orderDirection: desc) {
      id
      name
      payoutToken
      payoutAmount
      createdAt
      sender {
        address
        greetingCount
      }
      verifier {
        address
      }
      claimed
      cancelled
    }
  }
`;

  const POTS_GQL = gql(POTS_GRAPHQL);
  const { data: potsData, error } = useQuery(POTS_GQL, { fetchPolicy: "network-only" });

  // Subgraph maybe not yet configured
  if (error) {
    console.error("Error fetching pots", error);
    return <></>;
  }

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="overflow-x-auto shadow-2xl rounded-xl">
        <table className="table bg-base-100 table-zebra">
          <thead>
            <tr className="rounded-xl">
              <th className="bg-primary"></th>
              <th className="bg-primary">Sender</th>
              <th className="bg-primary">Greetings</th>
            </tr>
          </thead>
          <tbody>{potsData?.name}</tbody>
        </table>
      </div>
    </div>
  );
};

export default PotsTable;
