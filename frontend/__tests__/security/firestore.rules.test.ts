import {
  assertSucceeds,
  assertFails,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-test',
      firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') }
    });
  });

  it('requires .edu email for user creation', async () => {
    const nonEduContext = testEnv.authenticatedContext('user1', {
      email: 'test@gmail.com'
    });
    
    const eduContext = testEnv.authenticatedContext('user2', {
      email: 'test@university.edu'
    });

    await assertFails(nonEduContext.firestore()
      .collection('users')
      .doc('user1')
      .set({ /* user data */ }));

    await assertSucceeds(eduContext.firestore()
      .collection('users')
      .doc('user2')
      .set({ /* user data */ }));
  });
}); 