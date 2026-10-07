// Type definitions for the Pi Network SDK
// Based on https://sdk.minepi.com/pi-sdk.js

export interface PiUser {
  uid: string;
  username: string;
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: Partial<PiPayment>) => void;
}

export interface PiPayment {
  identifier: string;
  user_uid: string;
  user: PiUser;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  to_address: string;
  created_at: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: null | {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

export interface PiAuthResult {
  user: PiUser;
  accessToken: string;
}

export interface PiIncompletePayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  to_address: string;
  created_at: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: null | { txid: string; verified: boolean; _link: string };
}

export type PiAuthScope = 'username' | 'payments' | 'wallet';

export interface PiSDK {
  init: (config: { version: string; sandbox: boolean }) => void;
  authenticate: (
    scopes: PiAuthScope[],
    onIncompletePaymentFound: (payment: PiIncompletePayment) => void
  ) => Promise<PiAuthResult>;
  createPayment: (paymentData: PiPaymentData, callbacks: PiPaymentCallbacks) => PiPayment;
  openShareDialog: (title: string, message: string, callback: () => void) => void;
  isNetworkAvailable: () => boolean;
}

declare global {
  interface Window {
    Pi?: PiSDK;
  }
}
