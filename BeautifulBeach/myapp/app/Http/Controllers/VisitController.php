<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use Illuminate\Http\Request;
use App\Services\ResponseService;
use Carbon\Carbon;

class VisitController extends Controller
{
    protected $response;

    public function __construct(ResponseService $response)
    {
        $this->response = $response;
    }
    public function store(Request $request)
    {
        try {
            $visit  =  new Visit();
            $visit->ip_address = $request->ip();
            $visit->save();
            return $this->response->json(
                true,
                'Add visit success',
                status: 200
            );
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }
    public function stats()
    {
        $today = Visit::whereDate('created_at', Carbon::today())->count();
        $thisWeek = Visit::whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])->count();
        $thisMonth = Visit::whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->count();
        $total = Visit::count();
        $online = Visit::where('updated_at', '>=', Carbon::now('Asia/Ho_Chi_Minh')->subMinutes(1))->count();

        return response()->json([
            'today' => $today,
            'week' => $thisWeek,
            'month' => $thisMonth,
            'total' => $total,
            'online' => $online
        ]);
    }
}
