<?php

namespace App\Http\Controllers\API;

use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {

        try {
            $validator = Validator::make($request->all(), [
                'name'     => 'required|string|max:255',
                'username' => 'required|string|max:50|unique:users,username',
                'email'    => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:6',
                'role'     => 'nullable|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Validation failed',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name'       => $request->name,
                'username'   => $request->username,
                'email'      => $request->email,
                'comp_id'    => $request->comp_id,
                'role'       => $request->role ?? 1,
                'password'   => Hash::make($request->password),
                'created_by' => 1,
            ]);

            $token = JWTAuth::fromUser($user);

            return response()->json([
                'status'       => 'success',
                'message'      => 'User registered successfully',
                'access_token' => $token,
                'token_type'   => 'bearer',
                'user'         => $user
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Something went wrong during registration',
                'error'   => $e->getMessage(),
                'trace'   => config('app.debug') ? $e->getTrace() : []
            ], 500);
        }
    }

    // Login
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        // Check if user exists and get status
        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Check if blocked
        if ($user->status == 0) {
            return response()->json(['error' => 'You are blocked by admin. Please contact support.'], 403);
        }

        // Try to authenticate
        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth('api')->factory()->getTTL() * 60,
            'user'         => auth('api')->user(),
        ]);
    }


    // Logout
    public function logout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Logged out successfully']);
    }

    // Get logged in user
    public function me()
    {
        return response()->json(auth('api')->user());
    }
}
