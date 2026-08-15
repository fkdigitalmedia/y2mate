'use client';

import React, { useEffect, useState } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle, X, RefreshCw, Clock, HardDrive } from 'lucide-react';
import { MediaFormat, JobState, JobStage, DownloadJob } from '@/lib/media/types';

interface ProgressModalProps {
  format: MediaFormat | null;
  videoTitle: string;
  mediaId: string;
  url: string;
  onClose: () => void;
}

export default function ProgressModal({
  format,
  videoTitle,
  mediaId,
  url,
  onClose,
}: ProgressModalProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<DownloadJob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize download job
  const initJob = React.useCallback(async () => {
    if (!format) return;
    setErrorMessage(null);
    setJob(null);
    setJobId(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, formatId: format.id, url }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.error?.message || json.error || 'Failed to start download job.');
        return;
      }

      setJobId(json.jobId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error initializing download job.');
    }
  }, [format, mediaId, url]);

  useEffect(() => {
    initJob();
  }, [initJob]);

  // Polling status every 1000ms
  useEffect(() => {
    if (!jobId) return;

    let isSubscribed = true;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/download/${jobId}`);
        const json = await res.json();

        if (json.success && json.job && isSubscribed) {
          setJob(json.job);

          // Stop polling if terminal state is reached
          if (['COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED'].includes(json.job.status)) {
            clearInterval(pollInterval);
          }
        } else if (!json.success && isSubscribed) {
          if (json.error?.code === 'JOB_EXPIRED') {
            clearInterval(pollInterval);
            initJob();
          } else {
            setErrorMessage(json.error?.message || 'Job session expired.');
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        // Continue polling on transient network fetch error
      }
    }, 1000);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [jobId]);

  if (!format) return null;

  const currentStatus: JobState = job ? job.status : 'QUEUED';
  const currentStage: JobStage = job ? job.stage : 'QUEUED';
  const progressPercentage = job ? job.progress : 5;

  const getStageLabel = (stage: JobStage, status: JobState): string => {
    if (status === 'COMPLETED') return 'Your download is ready';
    if (status === 'EXPIRED') return 'Download link expired';
    if (status === 'CANCELLED') return 'Job cancelled';

    switch (stage) {
      case 'QUEUED':
        return 'Queued for processing...';
      case 'DOWNLOADING':
        return 'Downloading media stream...';
      case 'PROCESSING':
        return 'Processing video & audio conversion...';
      case 'UPLOADING':
        return 'Uploading to secure storage...';
      case 'COMPLETED':
        return 'Your download is ready';
      case 'FAILED':
        return 'Processing failed';
      default:
        return 'Preparing your download...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl space-y-5 text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title & Stage */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            y2matevideo Downloader Engine
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
            {currentStatus === 'COMPLETED' ? 'Your Download is Ready' : 'Preparing Your Download'}
          </h3>
          <p className="text-xs text-slate-500 font-mono line-clamp-1">
            {videoTitle}
          </p>
        </div>

        {/* Format & File Details Card */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono font-bold text-xs flex items-center justify-center uppercase">
              {format.extension}
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{job?.fileName || `${format.quality} ${format.extension.toUpperCase()}`}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                <span>{job?.fileSize || format.fileSize || 'Processing...'}</span>
                <span>•</span>
                <span>{format.mimeType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar & Status Display */}
        {!errorMessage && currentStatus !== 'FAILED' && currentStatus !== 'EXPIRED' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                {currentStatus !== 'COMPLETED' ? (
                  <Loader2 className="w-3.5 h-3.5 text-slate-900 dark:text-white animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                {getStageLabel(currentStage, currentStatus)}
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                {progressPercentage}%
              </span>
            </div>

            {/* Clean Progress Track */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-slate-900 dark:bg-white transition-all duration-200"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMessage || job?.errorMessage || 'Processing failed.'}</span>
            </div>

            <button
              onClick={initJob}
              className="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Process Again</span>
            </button>
          </div>
        )}

        {/* Ready State Download Button */}
        {currentStatus === 'COMPLETED' && job?.downloadUrl && (
          <div className="space-y-2 pt-1">
            <a
              href={job.downloadUrl}
              download={job.fileName || `media.${format.extension}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Download File ({job.fileSize || format.fileSize || 'File'})</span>
            </a>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Signed link active for ~30 minutes. Auto-purged after cleanup.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
