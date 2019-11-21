<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Helpers;
use Illuminate\Support\Facades\Storage;
use Laravel\Lumen\Routing\Controller;

/*
 * file - api/app/Http/Controllers/PictureController.php
 * author - Patrick Richeal
 * 
 * Picture controller file, has all the functions to do the various
 * actions related to a picture
 */

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

        // Get file type of the picture file
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
            'per_page' => 'integer|max:30',
            'username' => 'string'
        ]);

        // Set page size to whatever they sent in or a default of 15
        $page_size = $request->input('page_size') ?? 15;

        // Query database for pictures
        $data = app('db')->table('pictures')
            ->join('users', 'users.id', 'pictures.user_id')
            ->select('pictures.id', 'pretty_id as picture_id', 'file_name', 'file_type', 'caption', 'username', 'pictures.created_at')
            ->orderBy('created_at', 'desc');

        // If pretty_id isn't null, add where clause
        if ($pretty_id != null) {
            $data->where('pretty_id', $pretty_id);
        }
        
        // If they sent a username, add where clause
        if ($request->has('username')) {
            $data->where('username', $request->input('username'));
        }
        
        // Retrieve results
        $data = $data->paginate($page_size)->toArray();
        
        // Do some stuff for each picture we are returning
        foreach ($data['data'] as &$item) {
            // Put url of picture together
            $item->url = env('APP_URL').'/public'.Storage::url($item->file_name.'.'.$item->file_type);
            
            // Get the comments for this picture
            $comments = app('db')->table('comments')
                ->join('users', 'comments.user_id', 'users.id')
                ->select('comments.id as comment_id', 'comment', 'username', 'comments.created_at')
                ->where('picture_id', $item->id)
                ->orderBy('created_at', 'asc')
                ->get();
            $item->comments = $comments->toArray();

            // Do some stuff for each comment
            foreach ($item->comments as &$comment) {
                $comment->comment_id = (string) $comment->comment_id;
            }

            // Unset some stuff we don't want to return
            unset($item->file_name);
            unset($item->file_type);
            unset($item->id);
        }

        if ($pretty_id == null) {
            return response()->json([
                'pictures' => $data['data'],
                'pagination' => [
                    'current_page' => $data['current_page'],
                    'last_page' => $data['last_page'],
                    'per_page' => $data['per_page']
                ]
            ]);
        } else {
            return response()->json(['picture' => $data['data']]);
        }
    }

    /*
     * Make a comment on a picture
     */
    public function comment(Request $request, $pretty_id) {
        $this->validate($request, [
            'comment' => 'required|string|max:256',
        ]);

        // Get picture_id of picture with given pretty_id
        $picture_id = app('db')->table('pictures')
            ->where('pretty_id', $pretty_id)
            ->value('id');

        $comment_id = app('db')->table('comments')
            ->insertGetId([
                'comment' => $request->input('comment'),
                'picture_id' => $picture_id,
                'user_id' => $request->user()
            ]);

        // Add comment id to response
        return response()->json(['comment_id' => (string) $comment_id]);
    }

    /*
     * Delete a comment from a picture
     */
    public function deleteComment(Request $request, $pretty_id, $comment_id) {
        // Ensure user is allowed to delete the comment they are trying to
        // delete (must be user who posted picture or comment)
        $allowed_to_delete = app('db')->table('pictures')
            ->join('comments', 'pictures.id', 'comments.picture_id')
            ->where('pretty_id', $pretty_id)
            ->where('comments.id', $comment_id)
            ->where(function ($query) use ($request) {
                $query->where('pictures.user_id', $request->user())
                      ->orWhere('comments.user_id', $request->user());
            })
            ->exists();
        
        if (!$allowed_to_delete) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Delete comment by setting it to null
        app('db')->table('comments')
            ->where('id', $comment_id)
            ->update(['comment' => null]);
        
        return response()->json((object)[]);
    }
}
