import { initializeApp } from 'firebase/app';
import {
	getFirestore,
	type DocumentData,
	CollectionReference,
	collection
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { userStore } from 'sveltefire';
import type { Decision } from './types';

const firebaseConfig = {
	apiKey: 'AIzaSyCdxfhEXgjcvIFF5GUUnFwnAscUj4HNsMY',
	authDomain: 'decision-copilot.firebaseapp.com',
	projectId: 'decision-copilot',
	storageBucket: 'decision-copilot.appspot.com',
	messagingSenderId: '698337109435',
	appId: '1:698337109435:web:1c6a069dcf70a3469bd09e',
	measurementId: 'G-FVPGZL8NDE'
};

export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
export const user = userStore(auth);

// This is just a helper to add the type to the db responses
const createCollection = <T = DocumentData>(collectionName: string) => {
	return collection(firestore, collectionName) as CollectionReference<T>;
};

export const decisions = createCollection<Decision>('decisions');
