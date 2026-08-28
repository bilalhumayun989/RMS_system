<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceLogController extends Controller
{
    /**
     * Return all logs with employee name, ordered by date desc.
     * Supports ?employee_id=X and ?date=YYYY-MM-DD query filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AttendanceLog::with('employee:id,name')
            ->orderByDesc('date')
            ->orderByDesc('created_at');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', (int) $request->query('employee_id'));
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->query('date'));
        }

        $logs = $query->get()->map(function (AttendanceLog $log) {
            return [
                'id'            => $log->id,
                'employee_id'   => $log->employee_id,
                'employee'      => $log->employee ? ['name' => $log->employee->name] : null,
                'date'          => $log->date->toDateString(),
                'check_in'      => $log->check_in,
                'check_out'     => $log->check_out,
                'status'        => $log->status,
                'notes'         => $log->notes,
                'created_at'    => $log->created_at,
                'updated_at'    => $log->updated_at,
            ];
        });

        return response()->json($logs);
    }

    /**
     * Create / upsert an attendance log.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'date'        => ['required', 'date'],
            'check_in'    => ['nullable', 'date_format:H:i'],
            'check_out'   => ['nullable', 'date_format:H:i'],
            'status'      => ['required', 'in:present,absent,late,half-day'],
            'notes'       => ['nullable', 'string'],
        ]);

        $log = AttendanceLog::updateOrCreate(
            ['employee_id' => $data['employee_id'], 'date' => $data['date']],
            $data
        );

        $log->load('employee:id,name');

        return response()->json([
            'id'          => $log->id,
            'employee_id' => $log->employee_id,
            'employee'    => $log->employee ? ['name' => $log->employee->name] : null,
            'date'        => $log->date->toDateString(),
            'check_in'    => $log->check_in,
            'check_out'   => $log->check_out,
            'status'      => $log->status,
            'notes'       => $log->notes,
            'created_at'  => $log->created_at,
            'updated_at'  => $log->updated_at,
        ], 201);
    }

    /**
     * Partial update of a log.
     */
    public function update(Request $request, AttendanceLog $attendance): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['sometimes', 'exists:employees,id'],
            'date'        => ['sometimes', 'date'],
            'check_in'    => ['sometimes', 'nullable', 'date_format:H:i'],
            'check_out'   => ['sometimes', 'nullable', 'date_format:H:i'],
            'status'      => ['sometimes', 'in:present,absent,late,half-day'],
            'notes'       => ['sometimes', 'nullable', 'string'],
        ]);

        $attendance->update($data);
        $attendance->load('employee:id,name');

        return response()->json([
            'id'          => $attendance->id,
            'employee_id' => $attendance->employee_id,
            'employee'    => $attendance->employee ? ['name' => $attendance->employee->name] : null,
            'date'        => $attendance->date->toDateString(),
            'check_in'    => $attendance->check_in,
            'check_out'   => $attendance->check_out,
            'status'      => $attendance->status,
            'notes'       => $attendance->notes,
            'created_at'  => $attendance->created_at,
            'updated_at'  => $attendance->updated_at,
        ]);
    }

    /**
     * Delete a log.
     */
    public function destroy(AttendanceLog $attendance): JsonResponse
    {
        $attendance->delete();

        return response()->json(['message' => 'Attendance log deleted.']);
    }
}
