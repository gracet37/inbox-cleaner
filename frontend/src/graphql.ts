import { gql } from "@apollo/client";

export const AUTH_QUERY = gql`
  query Auth {
    auth {
      connected
      email
    }
  }
`;

export const INBOX_QUERY = gql`
  query Inbox {
    inbox {
      messages {
        id
        from
        email
        subject
        snippet
        receivedAt
        unread
        category
      }
      stats {
        total
        unread
        newsletters
        promotions
      }
    }
  }
`;

export const CLEAN_MESSAGES_MUTATION = gql`
  mutation CleanMessages($ids: [ID!]!) {
    cleanMessages(ids: $ids) {
      removed
      inbox {
        messages {
          id
          from
          email
          subject
          snippet
          receivedAt
          unread
          category
        }
        stats {
          total
          unread
          newsletters
          promotions
        }
      }
    }
  }
`;

export const DISCONNECT_GMAIL_MUTATION = gql`
  mutation DisconnectGmail {
    disconnectGmail {
      connected
      email
    }
  }
`;
