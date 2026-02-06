<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Beach;      
use App\Models\ImageBeach;   
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class BeachController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware(['auth:sanctum', 'user.type:admin']);
    // }

    /**
     * Lấy danh sách bãi biển (kèm tìm kiếm)
     */
    public function index(Request $request)
    {
        try {
            $search = $request->query("search");

            $query = Beach::with(['images', 'region'])->orderBy('id', 'desc');


            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('location', 'LIKE', "%{$search}%")
                      ->orWhereHas('region', function ($sq) use ($search) {
                          $sq->where('name', 'LIKE', "%{$search}%");
                      });
                });
            }

            $beaches = $query->get();

            return response()->json([
                'success' => true,
                'data' => $beaches,
                'status' => 200
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'errors' => $th->getMessage(),
                'status' => 500
            ], 500);
        }
    }


    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $request->validate([
                'name' => 'required|string|unique:regions,name',
                'description' => 'required|string',
                'location' => 'required|string',
                'latitude'    => 'required|numeric|between:-90,90',
                'longitude'   => 'required|numeric|between:-180,180',
                'region_id' => 'required|integer|exists:regions,id',
                'images'   => 'required|array|max:5|min:1',
                'images.*' => 'image|mimes:jpg,jpeg,png|max:2048',
            ]);

            $beach = new Beach();
            $beach->name = $request->name;
            $beach->description = $request->description;
            $beach->location = $request->location;
            $beach->latitude = $request->latitude;
            $beach->longitude = $request->longitude;
            $beach->region_id = $request->region_id;
            $beach->save();

            $dataImage = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    $path = $file->store('beaches', 'public');
                    $fullUrl = asset('storage/' . $path);

                    $dataImage[] = [
                        'img_link' => $fullUrl,
                        'beach_id' => $beach->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                ImageBeach::insert($dataImage);
            }

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Add beach success', 'status' => 200], 200);

        } catch (\Exception $th) {
            DB::rollBack();
            return response()->json(['success' => false, 'errors' => $th->getMessage(), 'status' => 422], 422);
        }
    }

    public function show($id)
    {
        try {
            $beach = Beach::with(['images', 'region'])->find($id);
            
            if (!$beach) {
                return response()->json(['success' => false, 'message' => 'Not found'], 404);
            }

            return response()->json(['success' => true, 'data' => $beach, 'status' => 200], 200);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'errors' => $th->getMessage()], 500);
        }
    }
    
    public function destroy($id)
    {
        try {
            $beach = Beach::findOrFail($id);
            $beach->delete();

            return response()->json([
                'success' => true,
                'message' => 'Delete beach success',
                'status' => 200
            ], 200);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'errors' => $th->getMessage()], 500);
        }
    }
}