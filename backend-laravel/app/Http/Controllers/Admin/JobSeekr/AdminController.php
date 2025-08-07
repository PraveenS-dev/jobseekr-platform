<?php

namespace App\Http\Controllers\Admin\JobSeekr;

use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Admin\JobSeekr\Job;
use Illuminate\Support\Facades\Auth;
use App\Models\Admin\JobSeekr\Bookmark;
use App\Models\Admin\JobSeekr\Category;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator;
use App\Models\Admin\JobSeekr\JobApplication;

class AdminController extends BaseController
{
    private $jobs;
    private $job_application;

    public function __construct()
    {
        $this->jobs = new Job();
        $this->job_application = new JobApplication();
    }

    public function dashboardStats(Request $request)
    {

        try {

            if (!Auth::check()) {
                return $this->sendError('Unauthorised.', ['error' => 'User not authenticated'], 401);
            }


            $total_users =  User::count();
            $total_jobseekers = User::where('role', '1')->count();
            $total_admins = User::where('role', '2')->count();
            $total_employer = User::where('role', '3')->count();

            // $total_jobs = Job::count();
            // $approved_jobs = Job::where('is_approved', 1)->count();
            // $pending_jobs = Job::where('is_approved', 0)->count();
            // $recent_jobs = Job::latest()->take(5)->get();

            $total_applications = JobApplication::count();
            $total_bookmarks = Bookmark::count();

            // $top_categories = Category::withCount('jobs')->orderBy('jobs_count', 'desc')->take(5)->get();

            $dashboardData = [
                'total_users' => $total_users,
                'total_jobseekers' => $total_jobseekers,
                'total_admins' => $total_admins,
                'total_employer' => $total_employer,

                'total_applications' => $total_applications,
                'total_bookmarks' => $total_bookmarks,

                // 'top_categories' => $top_categories,
            ];


            $success = [
                'success' => $dashboardData
            ];

            return $this->sendResponse($success, 'Dashboard stats fetched successfully');
        } catch (Exception $ex) {

            report($ex);
            return $this->sendError('Unauthorised.', ['error' => 'Unauthorised'], 401);
        }
    }

    public function getConnections(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $excludeRole = $request->get('exclude_role', 2);
            $currentUserId = $request->get('current_user_id');

            $users = User::where('role', '!=', $excludeRole)
                ->where('id', '!=', $currentUserId) // Exclude current user
                ->where('status', 1) // Only active users
                ->inRandomOrder()
                ->limit($limit)
                ->select([
                    'id',
                    'name',
                    'username',
                    'email',
                    'profile_path',
                    'location',
                    'headline',
                    'skills',
                    'created_at'
                ])
                ->get();

            // Add enc_id for each user
            $users->transform(function ($user) {
                $user->enc_id = encryptId($user->id);
                return $user;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => $users
                ],
                'message' => 'Connections fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch connections',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function searchConnections(Request $request)
    {
        try {
            $searchTerm = $request->get('search', '');
            $currentUserId = $request->get('current_user_id');
            $excludeRole = $request->get('exclude_role', 2);

            if (empty($searchTerm)) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'users' => []
                    ],
                    'message' => 'No search term provided'
                ]);
            }

            $users = User::where('role', '!=', $excludeRole)
                ->where('id', '!=', $currentUserId) // Exclude current user
                ->where('status', 1) // Only active users
                ->where(function($query) use ($searchTerm) {
                    $query->where('name', 'LIKE', "%{$searchTerm}%")
                          ->orWhere('username', 'LIKE', "%{$searchTerm}%")
                          ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                })
                ->select([
                    'id',
                    'name',
                    'username',
                    'email',
                    'profile_path',
                    'location',
                    'headline',
                    'skills',
                    'created_at'
                ])
                ->limit(20) // Limit search results to 20
                ->get();

            // Add enc_id for each user
            $users->transform(function ($user) {
                $user->enc_id = encryptId($user->id);
                return $user;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => $users
                ],
                'message' => 'Search results fetched successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search connections',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
