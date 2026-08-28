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
            'type' => ['required', Rule::in(['admin', 'employee'])],
            'pin' => ['nullable', 'string'],
            'email' => ['nullable', 'string'],
            'password' => ['nullable', 'string'],
        ]);

        $login = LoginCredential::attempt($credentials);

        if ($login === null) {
            return response()->json([
                'message' => LoginCredential::failureMessage($credentials['type']),
            ], 401);
        }

        $token = $login['employee']->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => ucfirst($login['role']).' Login Successful!',
            'token' => $token,
            'role' => $login['role'],
            'role_name' => $login['role_name'],
            'name' => $login['name'],
            'screen' => $login['screen'],
            'permissions' => $login['permissions'],
        ]);
    }
}
