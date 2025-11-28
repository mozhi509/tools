export interface VideoTrimRequest {
  videoPath: string;
  startTime: number;
  endTime: number;
  outputName: string;
}

export interface VideoTrimResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

export interface VideoMergeRequest {
  videoPaths: string[];
  outputName: string;
}

export interface VideoMergeResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

export interface VideoFilterRequest {
  videoPath: string;
  filters: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    grayscale?: number;
    sepia?: number;
    hueRotate?: number;
  };
  outputName: string;
}

export interface VideoFilterResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}