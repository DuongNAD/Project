<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Region;
use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RegionController extends Controller
{
    protected $response;
    
    public function __construct(ResponseService $response)
    {
        $this->response = $response;
    }

    public function index(Request $request)
    {
        $search = $request->query("search");
        try {
            return $this->response->json(true, data: !$search ? Region::all() : Region::where('name', 'LIKE', '%' . $search . '%')->get() , status: 200);
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|unique:regions,name'
            ]);

            $region = new Region(); 
            $region->name = $request->name;
            $region->save();
            
            return $this->response->json(
                true,
                'Add region success',
                status: 200
            );
        } catch (ValidationException $th) {
            return $this->response->json(
                false,
                errors: $th->errors(),
                status: 422,
            );
        }
    }

    public function show(string $id)
    {
        try {
            return $this->response->json(true, data: Region::findOrFail($id), status: 200);
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $region = Region::findOrFail($id);
        try {
            $request->validate([
                'name' => 'required|string|unique:regions,name,' . $region->id
            ]);
            $region->name = $request->name;
            $region->save();
            return $this->response->json(
                true,
                'Update region success',
                status: 200
            );
        } catch (ValidationException $th) {
            return $this->response->json(
                false,
                errors: $th->errors(),
                status: 422,
            );
        }
    }

    public function destroy(string $id)
    {
        $region = Region::findOrFail($id);
        try {
            $region->delete();
            return $this->response->json(
                true,
                'Delete region success',
                status: 200
            );
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }
}