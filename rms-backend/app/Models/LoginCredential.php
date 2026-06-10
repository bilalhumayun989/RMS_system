<?php

namespace App\Models;

use Illuminate\Support\Facades\Hash;

class LoginCredential
{
    public const ROLES = ['staff', 'admin', 'kitchen'];

    private const SCREENS = [
        'staff' => 'staff',
        'kitchen' => 'kitchen',
        'admin' => 'dashboard',
    ];

    public static function attempt(array $credentials): ?array
    {
        $role = $credentials['role'];

        if ($role === 'admin') {
            $email = strtolower(trim($credentials['email'] ?? ''));
            $password = $credentials['password'] ?? '';
            $employee = Employee::query()
                ->where('role', 'admin')
                ->where('email', $email)
                ->where('is_active', true)
                ->first();

            if (! $employee || ! $employee->password || ! Hash::check($password, $employee->password)) {
                return null;
            }
        } else {
            $employee = Employee::query()
                ->where('role', $role)
                ->where('pin', $credentials['pin'] ?? '')
                ->where('is_active', true)
                ->first();

            if (! $employee) {
                return null;
            }
        }

        return [
            'role' => $role,
            'screen' => self::SCREENS[$role],
        ];
    }

    public static function failureMessage(string $role): string
    {
        return $role === 'admin'
            ? 'Invalid admin email or password.'
            : "Invalid PIN for {$role}.";
    }
}
