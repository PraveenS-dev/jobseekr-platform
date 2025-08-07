<?php

namespace App\Http\Controllers\Admin\JobSeekr;

use Exception;
use Illuminate\Http\Request;
use App\Models\Admin\JobSeekr\Job;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator;
use App\Models\Admin\JobSeekr\JobApplication;

class AdminJobController extends BaseController
{
    private $jobs;
    private $job_application;

    public function __construct()
    {
        $this->jobs = new Job();
        $this->job_application = new JobApplication();
    }

    public function approve(Request $request)
    {
        try {

            if (!Auth::check()) {
                return $this->sendError('Unauthorised.', ['error' => 'User not authenticated'], 401);
            }

            $job_id = $request->id;
            $job_application = $this->jobs->approve($job_id);

            $success = [
                'success' => $job_application
            ];

            return $this->sendResponse($success, 'Job successfully created');
        } catch (Exception $ex) {

            report($ex);
            return $this->sendError('Unauthorised.', ['error' => 'Unauthorised'], 401);
        }
    }
}
