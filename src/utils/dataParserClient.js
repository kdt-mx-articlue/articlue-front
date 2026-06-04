let worker = null;

let requestSequence = 0;

const pendingRequests = new Map();

function getWorker() {
  if (worker) {
    return worker;
  }

  worker = new Worker(
    new URL("../workers/dataParser.worker.js", import.meta.url),
    {
      type: "module",
    }
  );

  worker.onmessage = (event) => {
    const { requestId, ok, result, error } = event.data || {};

    const pending = pendingRequests.get(requestId);

    if (!pending) {
      return;
    }

    pendingRequests.delete(requestId);

    if (ok) {
      pending.resolve(result);
    } else {
      pending.reject(new Error(error || "Worker parse failed"));
    }
  };

  worker.onerror = (error) => {
    console.error("DataParser Worker Error:", error);
  };

  return worker;
}

export function parseWithWorker(parserType, payload) {
  const currentWorker = getWorker();

  return new Promise((resolve, reject) => {
    requestSequence += 1;

    const requestId = `parser-${Date.now()}-${requestSequence}`;

    pendingRequests.set(requestId, {
      resolve,
      reject,
    });

    currentWorker.postMessage({
      requestId,
      parserType,
      payload,
    });
  });
}

export async function parseResumeData(payload) {
  return parseWithWorker("resume", payload);
}

export async function parseCoverLetterData(payload) {
  return parseWithWorker("coverLetters", payload);
}

export async function parseInterviewData(payload) {
  return parseWithWorker("interviewResults", payload);
}

export async function parseFavoriteJobData(payload) {
  return parseWithWorker("favoriteJobs", payload);
}

export function destroyParserWorker() {
  if (!worker) {
    return;
  }

  worker.terminate();

  worker = null;

  pendingRequests.clear();
}