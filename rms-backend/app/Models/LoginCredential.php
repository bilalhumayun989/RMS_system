<?php

namespace App\Models;

use Illuminate\Support\Facades\Hash;

class LoginCredential
{
    public static function attempt(array $credentials): ?array
    {
        $type = $credentials['type'];

        if ($type === 'admin') {
            $email = strtolower(trim($credentials['email'] ?? ''));
            $password = $credentials['password'] ?? '';
            $employee = Employee::query()
                ->with('role')
                ->where('email', $email)
                ->where('is_active', true)
                ->first();

            if (! $employee || ! $employee->password || ! Hash::check($password, $employee->password)) {
                return null;
            }

            // Only employees with /settings permission can log in as admin (via email/password)
            $empPermissions = $employee->role?->permissions ?? [];
            if (! in_array('/settings', $empPermissions)) {
                return null;
            }
        } else {
            $pin = $credentials['pin'] ?? '';
            if (empty($pin)) {
                return null;
            }
            $employee = Employee::query()
                ->with('role')
                ->where('pin', $pin)
                ->whereNotNull('pin')
                ->where('is_active', true)
                ->first();

            if (! $employee) {
                return null;
            }

            // Prevent admins from logging in via PIN (only regular employees can use PIN)
            $empPermissions = $employee->role?->permissions ?? [];
            if (in_array('/settings', $empPermissions)) {
                return null;
            }
        }

        $roleName = $employee->role ? $employee->role->name : 'Employee';
        $permissions = $employee->role ? ($employee->role->permissions ?? []) : [];

        // Determine default screen based on permissions
        $screen = 'tables';
        if (in_array('/dashboard', $permissions)) {
            $screen = 'dashboard';
        } elseif (in_array('/kitchen', $permissions) && ! in_array('/tables', $permissions)) {
            $screen = 'kitchen';
        }

        return [
            'employee'      => $employee,
            'name'          => $employee->name,
            'role_name'     => $roleName,
            'role'          => strtolower($roleName),
            'screen'        => $screen,
            'permissions'   => $permissions,
        ];
    }

    public static function failureMessage(string $type): string
    {
        return $type === 'admin'
            ? 'Invalid admin email or password.'
            : 'Invalid PIN entered.';
    }
}
