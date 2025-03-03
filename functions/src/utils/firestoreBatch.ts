import { db } from "../config/firebase";
import {
  DocumentData,
  WriteBatch,
  DocumentReference,
  SetOptions,
} from "firebase-admin/firestore";

/**
 * A utility class for handling Firestore batch operations
 */
export class BatchManager {
  private batch: WriteBatch;
  private operationCount: number;
  private readonly MAX_OPERATIONS = 500; // Firestore limit

  constructor() {
    this.batch = db.batch();
    this.operationCount = 0;
  }

  /**
   * Add a document to a collection in the batch
   * @param collectionPath - The collection path
   * @param data - The document data
   * @returns The document reference
   */
  public create(collectionPath: string, data: DocumentData): DocumentReference {
    const docRef = db.collection(collectionPath).doc();
    this.batch.create(docRef, data);
    this.operationCount++;
    this.checkOperationCount();
    return docRef;
  }

  /**
   * Set a document in the batch
   * @param docRef - The document reference
   * @param data - The document data
   * @param options - Set options
   */
  public set(
    docRef: DocumentReference,
    data: DocumentData,
    options?: SetOptions
  ): void {
    this.batch.set(docRef, data, options || {});
    this.operationCount++;
    this.checkOperationCount();
  }

  /**
   * Update a document in the batch
   * @param docRef - The document reference
   * @param data - The update data
   */
  public update(docRef: DocumentReference, data: DocumentData): void {
    this.batch.update(docRef, data);
    this.operationCount++;
    this.checkOperationCount();
  }

  /**
   * Delete a document in the batch
   * @param docRef - The document reference
   */
  public delete(docRef: DocumentReference): void {
    this.batch.delete(docRef);
    this.operationCount++;
    this.checkOperationCount();
  }

  /**
   * Commit the batch
   * @returns A promise that resolves when the batch is committed
   */
  public async commit(): Promise<void> {
    if (this.operationCount > 0) {
      await this.batch.commit();
      this.batch = db.batch();
      this.operationCount = 0;
    }
  }

  /**
   * Check if the operation count is approaching the limit
   * If it is, commit the batch and start a new one
   */
  private async checkOperationCount(): Promise<void> {
    if (this.operationCount >= this.MAX_OPERATIONS) {
      await this.commit();
    }
  }
}

/**
 * Create a new batch manager
 * @returns A new BatchManager instance
 */
export function createBatchManager(): BatchManager {
  return new BatchManager();
}

/**
 * Delete a collection in batches
 * @param collectionPath - The collection path
 * @param batchSize - The batch size (default: 100)
 */
export async function deleteCollection(
  collectionPath: string,
  batchSize = 100
): Promise<void> {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, batchSize, resolve, reject);
  });
}

/**
 * Delete a query batch
 * @param query - The query
 * @param batchSize - The batch size
 * @param resolve - The resolve function
 * @param reject - The reject function
 */
async function deleteQueryBatch(
  query: FirebaseFirestore.Query,
  batchSize: number,
  resolve: (value: void | PromiseLike<void>) => void,
  reject: (reason?: Error) => void
): Promise<void> {
  try {
    const snapshot = await query.get();

    // When there are no documents left, we are done
    if (snapshot.size === 0) {
      resolve();
      return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(query, batchSize, resolve, reject);
    });
  } catch (err) {
    reject(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Migrate a collection to a new schema
 * @param collectionPath - The collection path
 * @param migrationFn - The migration function
 * @param batchSize - The batch size (default: 100)
 */
export async function migrateCollection(
  collectionPath: string,
  migrationFn: (doc: DocumentData) => DocumentData,
  batchSize = 100
): Promise<void> {
  const collectionRef = db.collection(collectionPath);
  let query = collectionRef.limit(batchSize);
  let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;
  let docsProcessed = 0;
  let hasMoreDocs = true;

  while (hasMoreDocs) {
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      hasMoreDocs = false;
      break;
    }

    const batchManager = createBatchManager();

    for (const doc of snapshot.docs) {
      const oldData = doc.data();
      const newData = migrationFn(oldData);

      batchManager.update(doc.ref, newData);
      lastDoc = doc;
      docsProcessed++;
    }

    await batchManager.commit();

    if (snapshot.size < batchSize) {
      break;
    }
  }

  console.log(`Migration complete. Processed ${docsProcessed} documents.`);
}
