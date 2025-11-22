import { Request, Response } from 'express';

export interface JsonRequest {
  json: string;
  indent?: number;
}

export interface Base64Request {
  text: string;
}

export interface Base64DecodeRequest {
  encoded: string;
}

export interface UrlRequest {
  url: string;
}

export interface ApiResponse {
  success: boolean;
  error?: string;
  details?: string;
}

export interface JsonFormatResponse extends ApiResponse {
  formatted?: string;
  original?: string;
}

export interface JsonValidateResponse extends ApiResponse {
  valid?: boolean;
  message?: string;
}

export interface JsonMinifyResponse extends ApiResponse {
  minified?: string;
  original?: string;
}

export interface Base64EncodeResponse extends ApiResponse {
  encoded?: string;
  original?: string;
}

export interface Base64DecodeResponse extends ApiResponse {
  decoded?: string;
  original?: string;
}

export interface UrlEncodeResponse extends ApiResponse {
  encoded?: string;
  original?: string;
}

export interface UrlDecodeResponse extends ApiResponse {
  decoded?: string;
  original?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}