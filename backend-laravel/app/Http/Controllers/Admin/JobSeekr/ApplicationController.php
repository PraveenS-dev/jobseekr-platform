<?php

namespace App\Http\Controllers\Admin\JobSeekr;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Admin\JobSeekr\Job;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator;
use App\Models\Admin\JobSeekr\JobApplication;

class ApplicationController extends BaseController
{


    private $jobs;
    private $job_application;

    public function __construct()
    {
        $this->jobs = new Job();
        $this->job_application = new JobApplication();
    }

    public function list(Request $request): JsonResponse
    {
        if (Auth::user()) {

            $search = $request->input('search', '');
            $query = $this->job_application->select(
                'jobseekr_job_applications.id',
                'jobseekr_job_applications.user_id',
                'jobseekr_job_applications.job_id',
                'jobseekr_job_applications.application_status',
                'jobseekr_job_applications.resume_path',
                'jobseekr_job_applications.created_at',
                'jobseekr_job_applications.created_by'
            );

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
                $data['enc_id'] = encryptId($listdata->id);
                $data['user_id'] = $listdata->user_id;
                $data['job_id'] = $listdata->job_id;
                $data['application_status'] = $listdata->application_status;
                $data['category_id'] = $listdata->category_id;
                $data['resume_path'] = ($listdata->resume_path);
                $data['created_at'] = $listdata->created_at;
                $data['created_by'] = getUsername($listdata->created_by);

                $data_array[] = $data;
            }

            $applicationDetails = [
                'per_page' => $listDetails['per_page'],
                'current_page' => $listDetails['current_page'],
                'from' => $listDetails['from'],
                'to' => $listDetails['to'],
                'total' => $listDetails['total'],
                'total_page' => $listDetails['last_page'],
                'list' => $data_array,
            ];

            $success = [
                'applicationDetails' => $applicationDetails
            ];

            return $this->sendResponse($success, 'Job List Details');
        } else {

            return $this->sendError('Unauthorised.', ['error' => 'Unauthorised'], 401);
        }
    }

    public function apply(Request $request)
    {

        try {
            if (!Auth::check()) {
                return $this->sendError('Unauthorised.', ['error' => 'User not authenticated'], 401);
            }

            $rules = [
                'job_id' => 'required',
            ];

            $messages = [
                'job_id.required' => 'Please enter job id.',
            ];

            $validator = Validator::make($request->all(), $rules, $messages);
            if ($validator->fails()) {
                return $this->sendError('Validation Error.', $validator->errors(), 422);
            }

            $job_id = $request->job_id;
            $job_application = $this->job_application->apply($job_id);

            $assigned_persons_id = $request->job_created_by;
            $title = "New Job Application";
            $message = getUsername(Auth::id()) . ' send a application for ' . $request->job_name . ' job.';

            $notification_data = array(
                'assign_person_ids' => $assigned_persons_id,
                'title' => $title,
                'message' => $message,
                'url' => "/application/view/" . encryptId($job_application->id),
            );

            notificationSave($notification_data);

            $success = [
                'success' => $job_application
            ];

            return $this->sendResponse($success, 'Job successfully created');
        } catch (Exception $ex) {

            report($ex);
            return $this->sendError('Unauthorised.', ['error' => $ex], 401);
        }
    }

    public function view(Request $request)
    {
        $id = decryptId($request->id);
        try {
            $data = $this->job_application->selectOne($id);

            $applicationDetails = [];

            $applicationDetails['id'] = $data->id;
            $applicationDetails['enc_id'] = encryptId($data->id);
            $applicationDetails['user_id'] = $data->user_id;
            $applicationDetails['job_id'] = $data->job_id;
            $applicationDetails['application_status'] = $data->application_status;
            $applicationDetails['resume_path'] = $data->resume_path;
            $applicationDetails['created_at'] = $data->created_at;
            $applicationDetails['created_by'] = getUsername($data->created_by);

            return $this->sendResponse($applicationDetails, 'Job List Details');
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => "Something went wrong!"], 401);
        }
    }

    public function getApplicationBasedonJobs(Request $request)
    {
        $id = ($request->job_id);

        try {
            $data = $this->job_application->getApplicationBasedonJobs($id);

            $applications = [];

            foreach ($data as $listdata) {
                $applicationDetails = [];
                $applicationDetails['id'] = $listdata->id;
                $applicationDetails['enc_id'] = encryptId($listdata->id);
                $applicationDetails['user_id'] = $listdata->user_id;
                $applicationDetails['job_id'] = $listdata->job_id;
                $applicationDetails['application_status'] = $listdata->application_status;
                $applicationDetails['category_id'] = $listdata->category_id;
                $applicationDetails['resume_path'] = $listdata->resume_path;
                $applicationDetails['created_at'] = $listdata->created_at;
                $applicationDetails['created_by'] = getUsername($listdata->created_by);

                $applications[] = $applicationDetails;
            }

            return $this->sendResponse($applications, 'Application List Details');
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => $id], 401);
        }
    }


    public function checkJobApplication(Request $request)
    {
        $job_id = $request->job_id;
        $exist = $this->job_application->checkJobApplication($job_id);
        $response = array(
            'existValue' => $exist ? true : false
        );

        return $this->sendResponse($response, "Unique Check!");
    }

    public function applicationViewed(Request $request)
    {
        try {
            $id = decryptId($request->id);
            $job_application = $this->job_application->selectOne($id);

            if ($job_application->application_status == JOB_APPLICATION_PENDING && Auth::user()->role == (ROLE_EMPLOYER)) {
                $this->job_application->applicationViewed($id);

                $assigned_persons_id = $job_application->created_by;
                $title = "Job Application Viewed";
                $message = 'Your Application for ' . $request->job_name . ' job has been viewed by ' . getUsername(Auth::id());

                $notification_data = array(
                    'assign_person_ids' => $assigned_persons_id,
                    'title' => $title,
                    'message' => $message,
                    'url' => "/application/view/" . encryptId($job_application->id),
                );

                notificationSave($notification_data);
            }

            $applicationDetails = array(
                "message" => "Application Viewed!"
            );

            return $this->sendResponse($applicationDetails, 'Application Viewed');
        } catch (Exception $ex) {
            report($ex);
            return $this->sendError('Unauthorised.', ['error' => "Something went wrong!"], 401);
        }
    }

    public function resumeViewed(Request $request)
    {
        try {
            $id = decryptId($request->id);
            $job_application = $this->job_application->selectOne($id);

            if ($job_application->application_status == JOB_APPLICATION_VIEWED && Auth::user()->role == (ROLE_EMPLOYER)) {
                $this->job_application->resumeViewed($id);

                $assigned_persons_id = $job_application->created_by;
                $title = "Resume Viewed";
                $message = 'Your resume has been viewed for ' . $request->job_name . ' job by ' . getUsername(Auth::id());

                $notification_data = array(
                    'assign_person_ids' => $assigned_persons_id,
                    'title' => $title,
                    'message' => $message,
                    'url' => "/application/view/" . encryptId($job_application->id),
                );

                notificationSave($notification_data);
            }

            $applicationDetails = array(
                "message" => "Resume Viewed!"
            );
            return $this->sendResponse($applicationDetails, 'Resume Viewed');
        } catch (Exception $ex) {
            report($ex);
            return $this->sendError('Unauthorised.', ['error' => "Something went wrong!"], 401);
        }
    }

    public function approval(Request $request)
    {
        try {
            $id = decryptId($request->id);
            $action = $request->action;
            $job_application = $this->job_application->selectOne($id);

            if ($action == 1) {
                $status = JOB_APPLICATION_APPROVED;
                $message = 'Your Application for ' . $request->job_name . ' has been Approved';
            } else {
                $status = JOB_APPLICATION_REJECTED;
                'Your Application for ' . $request->job_name . ' has been Rejected';
            }
            $this->job_application->approval($id, $status);

            $assigned_persons_id = $job_application->created_by;
            $title = "Job Application";

            $notification_data = array(
                'assign_person_ids' => $assigned_persons_id,
                'title' => $title,
                'message' => $message,
                'url' => "/application/view/" . encryptId($job_application->id),
            );

            notificationSave($notification_data);

            $applicationDetails = array(
                "message" => $message . " !"
            );
            return $this->sendResponse($applicationDetails, $message . ' !');
        } catch (Exception $ex) {
            report($ex);
            return $this->sendError('Unauthorised.', ['error' => "Something went wrong!"], 401);
        }
    }
}
