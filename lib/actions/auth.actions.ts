import { auth, db } from "@/firebase/admin";
import {cookies} from "next/dist/server/request/cookies";

'USE SERVER';

const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
    const {uid, name, email} = params;

    try {
        const userRecord = await db.collection("users").doc(uid).get();

        if(userRecord.exists){
            return {
                success: false, // Fixed: was 'fetch'
                message: 'User already exists. Please sign in instead'
            }
        }

        await db.collection("users").doc(uid).set({
            name, email
        })

    } catch (e: unknown) { // Changed from 'any' to 'unknown'
        console.error('Error creating a user', e);

        // Type guard to safely access properties
        if (e && typeof e === 'object' && 'code' in e && e.code === 'auth/email-already-in-use') {
            return {
                success: false,
                message: 'This email is already in use'
            }
        }

        return {
            success: false,
            message: 'Failed to create an account'
        };
    }
}

export async function signIn(params: SignInParams) {
    const {email, idToken} = params;

    try{
        const userRecord = await auth.getUserByEmail(email);

        if(!userRecord){
            return {
                success: false,
                message: 'User does not exist. Create an account instead.'
            }
        }
        await setSessionCookie(idToken);
    }catch (e){
        console.log(e)
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    // Create session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION * 1000, // milliseconds
    });

    // Set cookie in the browser
    cookieStore.set("session", sessionCookie, {
        maxAge: SESSION_DURATION,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
    });
}