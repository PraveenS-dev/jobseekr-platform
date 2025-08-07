<?php

namespace App\Http\Controllers\Admin\JobSeekr;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Admin\JobSeekr\Bookmark;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator;

class BookmarkController extends BaseController
{
    private $job_book_mark;

    public function __construct()
    {
        $this->job_book_mark = new Bookmark();
    }

    public function list(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return $this->sendError('Unauthorised.', ['error' => 'Unauthorised'], 401);
        }

        $search = $request->input('search', '');
        $query = $this->job_book_mark->select(
            'jobseekr_book_marks.id',
            'jobseekr_book_marks.user_id',
            'jobseekr_book_marks.job_id',
            'jobseekr_book_marks.created_at',
            'jobseekr_book_marks.created_by'
        )->where('created_by', Auth::id());

        if ($search != '') {
        }

        /**
         * Role Based list view condition end
         */

        $query = $query->orderBy('id', 'DESC')->paginate($request->input('per_page', 10));

        $listDetails = $query->toArray();

        $data_array = [];
        foreach ($query as $listdata) {
            $data = [];

            $data['id'] = $listdata->id;
            $data['user_id'] = $listdata->user_id;
            $data['job_id'] = $listdata->job_id;

            $data['title'] = $listdata->title;
            $data['description'] = $listdata->description;
            $data['category_id'] = $listdata->category_id;
            $data['location'] = ($listdata->location);
            $data['salary'] = ($listdata->salary);
            $data['job_type'] = $listdata->job_type;

            $data['created_at'] = $listdata->created_at;
            $data['created_by'] = $listdata->created_by;

            $data_array[] = $data;
        }

        $book_mark_details = [
            'per_page' => $listDetails['per_page'],
            'current_page' => $listDetails['current_page'],
            'from' => $listDetails['from'],
            'to' => $listDetails['to'],
            'total' => $listDetails['total'],
            'total_page' => $listDetails['last_page'],
            'list' => $data_array,
        ];

        $success = [
            'book_mark_details' => $book_mark_details
        ];

        return $this->sendResponse($success, 'Job List Details');
    }

    public function store(Request $request)
    {
        try {
            if (!Auth::check()) {
                return $this->sendError('Unauthorised.', ['error' => 'User not authenticated'], 401);
            }

            $rules = [
                'job_id' => 'required',
            ];

            $messages = [
                'job_id.required' => 'Job ID is required.',
            ];

            $validator = Validator::make($request->all(), $rules, $messages);

            if ($validator->fails()) {
                return $this->sendError('Validation Error.', $validator->errors(), 422);
            }

            $job_id = $request->job_id;
            $job_book_mark = $this->job_book_mark->store($job_id);

            $success = [
                'bookmark_id' => $job_book_mark->id,
            ];

            return $this->sendResponse($success, 'Job bookmarked successfully');
        } catch (Exception $ex) {
            report($ex);
            return $this->sendError('Server Error.', ['error' => 'Something went wrong'], 500);
        }
    }

    public function remove(Request $request)
    {
        try {
            if (!Auth::check()) {
                return $this->sendError('Unauthorised.', ['error' => 'User not authenticated'], 401);
            }

            $rules = [
                'job_id' => 'required',
            ];

            $messages = [
                'job_id.required' => 'Job ID is required.',
            ];

            $validator = Validator::make($request->all(), $rules, $messages);

            if ($validator->fails()) {
                return $this->sendError('Validation Error.', $validator->errors(), 422);
            }

            $job_id = $request->job_id;
            $job_book_mark = $this->job_book_mark->remove($job_id);

            $success = [
                'bookmark_id' => $job_book_mark,
            ];

            return $this->sendResponse($success, 'Job bookmarked successfully');
        } catch (Exception $ex) {
            report($ex);
            return $this->sendError('Server Error.', ['error' => 'Something went wrong'], 500);
        }
    }

    public function getBookmarkdata(Request $request)
    {
        try {
            if (!Auth::check()) {
                return $this->sendError('Unauthorised.', ['error' => 'User not authenticated'], 401);
            }

            $job_id = $request->job_id;
            $job_book_mark = $this->job_book_mark->getdata($job_id);

            $success = [
                'job_book_mark' => $job_book_mark,
            ];

            return $this->sendResponse($success, 'Job bookmarked Details');
        } catch (Exception $ex) {
            report($ex);
            return $this->sendError('Server Error.', ['error' => 'Something went wrong'], 500);
        }
    }
}
