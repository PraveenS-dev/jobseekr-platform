<?php

namespace App\Http\Controllers\Admin\JobSeekr;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Admin\JobSeekr\Job;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator;

class JobController extends BaseController
{

    private $jobs;

    public function __construct()
    {
        $this->jobs = new Job();
    }

    public function list(Request $request): JsonResponse
    {
        if (Auth::user()) {

            $search = $request->input('search', '');
            $query = $this->jobs->newQuery();

            if ($search != '') {
                $query = $query->orWhere('title', "LIKE", "%" . $search . "%");
                $query = $query->orWhere('description', "LIKE", "%" . $search . "%");
                $query = $query->orWhere('category_id', "LIKE", "%" . $search . "%");
                $query = $query->orWhere('location', "LIKE", "%" . $search . "%");
                $query = $query->orWhere('job_type', "LIKE", "%" . $search . "%");
                $query = $query->orWhere('is_approved', "LIKE", "%" . $search . "%");
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
                $data['title'] = $listdata->title;
                $data['description'] = $listdata->description;
                $data['category_id'] = $listdata->category_id;
                $data['location'] = ($listdata->location);
                $data['salary'] = ($listdata->salary);
                $data['job_type'] = $listdata->job_type;
                $data['is_approved'] = $listdata->is_approved;
                $data['created_at'] = $listdata->created_at;
                $data['created_by'] = $listdata->created_by;

                $data_array[] = $data;
            }

            $jobDetails = [
                'per_page' => $listDetails['per_page'],
                'current_page' => $listDetails['current_page'],
                'from' => $listDetails['from'],
                'to' => $listDetails['to'],
                'total' => $listDetails['total'],
                'total_page' => $listDetails['last_page'],
                'list' => $data_array,
            ];

            $success = [
                'jobDetails' => $jobDetails
            ];

            return $this->sendResponse($success, 'Job List Details');
        } else {

            return $this->sendError('Unauthorised.', ['error' => 'Unauthorised'], 401);
        }
    }

    public function view(Request $request)
    {
        $id = $request->id;
        try {
            $data = $this->jobs->find($id);
            return $this->sendResponse($data, 'Job List Details');
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => $ex], 401);
        }
    }

}
