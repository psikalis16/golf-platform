<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new golfer account for this tenant.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $tenant = app('tenant');

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => $request->password,
            'tenant_id' => $tenant->id,
            'role'      => 'golfer',
        ]);

        $token = $user->createToken('app')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    /**
     * Authenticate a user and return an API token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $tenant = app('tenant');

        $user = User::where('email', $request->email)
            ->where('tenant_id', $tenant->id)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Revoke any existing tokens before issuing a new one
        $user->tokens()->delete();
        $token = $user->createToken('app')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    /**
     * Log out the authenticated user by revoking their current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * Return the currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /**
     * Allow an authenticated user to change their password.
     * Clears the must_change_password flag on success.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        $user->update([
            'password'             => $request->password,
            'must_change_password' => false,
        ]);

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
