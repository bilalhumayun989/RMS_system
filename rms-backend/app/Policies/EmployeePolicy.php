<?php

namespace App\Policies;

use App\Models\Employee;

class EmployeePolicy
{
    public function viewAny(Employee $employee): bool
    {
        return $this->canManageSettings($employee);
    }

    public function view(Employee $employee): bool
    {
        return $this->canManageSettings($employee);
    }

    public function create(Employee $employee): bool
    {
        return $this->canManageSettings($employee);
    }

    public function update(Employee $employee): bool
    {
        return $this->canManageSettings($employee);
    }

    public function delete(Employee $employee): bool
    {
        return $this->canManageSettings($employee);
    }

    private function canManageSettings(Employee $employee): bool
    {
        return in_array('/settings', $employee->role?->permissions ?? []);
    }
}
