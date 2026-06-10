<?php

namespace App\Http\Controllers;

use App\Models\LoginCredential;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'role' => ['required', Rule::in(LoginCredential::ROLES)],
            'pin' => ['nullable', 'string'],
            'email' => ['nullable', 'string'],
            'password' => ['nullable', 'string'],
        ]);

        $login = LoginCredential::attempt($credentials);

        if ($login === null) {
            return response()->json([
                'message' => LoginCredential::failureMessage($credentials['role']),
            ], 401);
        }

        return response()->json([
            'message' => ucfirst($login['role']).' Login Successful!',
            'role' => $login['role'],
            'screen' => $login['screen'],
        ]);
    }
}
