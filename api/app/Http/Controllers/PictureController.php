<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Helpers;
use Illuminate\Support\Facades\Storage;

class PictureController extends Controller
{
    /**
     * Upload a picture
     */
    public function upload(Request $request)
    {
        $this->validate($request, [
            'picture' => 'required|image|max:20000',
            'caption' => 'string|max:256'
        ]);

        $file_type = $request->file('picture')->getClientOriginalExtension();

        // Make sure file type is one that we support
        if (!in_array($file_type, ['png', 'jpg', 'jpeg', 'gif'])) {
            return response()->json(['error' => 'Unsupported file type'], 400);
        }

        // Generate file name for picture
        $file_name = $this->getUniquePictureFileName();

        // Store picture on server
        $request->file('picture')->storeAs('public', $file_name.'.'.$file_type);

        // Generate unique pretty id
        $pretty_id = $this->getUniquePicturePrettyId();

        // Insert picture into pictures table
        $insert_data = [
            'pretty_id' => $pretty_id,
            'file_name' => $file_name,
            'file_type' => $file_type,
            'user_id' => $request->user()
        ];

        if ($request->has('caption')) { $insert_data['caption'] = $request->input('caption'); }

        app('db')->table('pictures')->insertGetId($insert_data);

        // Add picture id (pretty_id) to response
        return response()->json(['picture_id' => (string) $pretty_id]);
    }

    /**
     * Returns an unused picture file name
     * 
     * @return string The unique picture file name
     */
    private function getUniquePictureFileName(): string {
        // Create a unique picture file name that has never been used
        $already_exists = true;
        while ($already_exists) {
            $file_name = Helpers::generateRandomString(32);
            $already_exists = app('db')->table('pictures')->where('file_name', $file_name)->exists();
        }

        return $file_name;
    }

    /**
     * Returns an unused picture pretty id
     * 
     * @return string The unique picture pretty id
     */
    private function getUniquePicturePrettyId(): string {
        // Create a unique picture pretty id that has never been used
        $already_exists = true;
        while ($already_exists) {
            $pretty_id = Helpers::generateRandomString(6);
            $already_exists = app('db')->table('pictures')->where('pretty_id', $pretty_id)->exists();
        }

        return $pretty_id;
    }

    /**
     * Get picture(s)
     */
    public function get(Request $request, $pretty_id = null)
    {
        $this->validate($request, [
            'page' => 'integer',
            'per_page' => 'integer|max:30'
        ]);

        $page_size = $request->input('page_size') ?? 15;

        $data = app('db')->table('pictures')
            ->select('pretty_id as picture_id', 'file_name', 'file_type', 'caption', 'user_id', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate($page_size)
            ->toArray();
        
        foreach ($data['data'] as &$item) {
            $item->user_id = (string) $item->user_id;
            $item->url = env('APP_URL').Storage::url($item->file_name.'.'.$item->file_type);
            unset($item->file_name);
            unset($item->file_type);
        }

        return response()->json([
            'pictures' => $data['data'],
            'pagination' => [
                'current_page' => $data['current_page'],
                'last_page' => $data['last_page'],
                'per_page' => $data['per_page']
            ]
        ]);
    }
}
