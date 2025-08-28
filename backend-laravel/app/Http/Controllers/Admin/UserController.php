<?php

namespace App\Http\Controllers\Admin;

use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\BaseController;
use App\Models\UserExperience;

class UserController extends BaseController
{
    private $users;
    private $user_exp;

    public function __construct()
    {
        $this->users = new User();
        $this->user_exp = new UserExperience();
    }

    public function list(Request $request): JsonResponse
    {
        if (Auth::user()) {

            $search = $request->search;
            $query = $this->users->newQuery();

            if ($search != '') {
                $query = $query->orWhere('name', "LIKE", "%" . $search . "%");
                $query = $query->orWhere('email', "LIKE", "%" . $search . "%");
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
                $data['name'] = $listdata->name;
                $data['username'] = $listdata->username;
                $data['profile_path'] = $listdata->profile_path;
                $data['email'] = $listdata->email;
                $data['role'] = $listdata->role;
                $data['role_name'] = getUserRole($listdata->role);
                $data['status'] = $listdata->status;
                $data['created_at'] = Displaydateformat($listdata->created_at);

                $data_array[] = $data;
            }

            $usersDetails = [
                'per_page' => $listDetails['per_page'],
                'current_page' => $listDetails['current_page'],
                'from' => $listDetails['from'],
                'to' => $listDetails['to'],
                'total' => $listDetails['total'],
                'total_page' => $listDetails['last_page'],
                'list' => $data_array,
            ];

            $success = [
                'usersDetails' => $usersDetails
            ];

            return $this->sendResponse($success, 'User List Details');
        } else {

            return $this->sendError('Unauthorised.', ['error' => 'Unauthorised'], 401);
        }
    }

    public function update(Request $request)
    {

        try {
            $id = decryptId($request->id);

            $this->users->updateUser($id);
            $this->user_exp->updateExperience($id, $request);

            $success = [
                'message' => "User updated"
            ];
            return $this->sendResponse($success, $request->experiences);
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => $ex], 401);
        }
    }

    public function StatusChange(Request $request)
    {

        try {
            $id = $request->id;

            $this->users->statuschange($id);

            $success = [
                'message' => "User status changed"
            ];
            return $this->sendResponse($success, "Status Successfuly changed");
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => 'Unauthorised'], 401);
        }
    }

    public function deleteUser(Request $request)
    {

        try {
            $id = $request->id;


            $this->users->deleteUser($id);

            $success = [
                'message' => "User Deleted Successfully"
            ];
            return $this->sendResponse($success, "Action successfuly done!");
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => 'Unauthorised'], 401);
        }
    }

    public function Profileview(Request $request)
    {
        try {

            $id = decryptId($request->id);

            $user = $this->users->SelectOne($id);
            $userDetails = [];

            $userDetails['id'] = $user->id;
            $userDetails['enc_id'] = encryptId($user->id);
            $userDetails['name'] = $user->name;
            $userDetails['email'] = $user->email;
            $userDetails['role'] = $user->role;
            $userDetails['role_name'] = getUserRole($user->role);
            $userDetails['status'] = $user->status;
            $userDetails['profile'] = $user->profile_path;
            $userDetails['cover_image'] = $user->cover_img_path;
            $userDetails['headline'] = $user->headline;
            $userDetails['created_at'] = Displaydateformat($user->created_at);

            $success = [
                'data' => $userDetails
            ];
            return $this->sendResponse($success, "User Details !");
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => 'Unauthorised'], 401);
        }
    }

    public function view(Request $request)
    {
        try {

            $id = decryptId($request->id);

            $user = $this->users->SelectOne($id);
            $userDetails = [];

            $userDetails['id'] = $user->id;
            $userDetails['enc_id'] = encryptId($user->id);
            $userDetails['name'] = $user->name;
            $userDetails['username'] = $user->username;
            $userDetails['email'] = $user->email;
            $userDetails['role'] = $user->role;
            $userDetails['role_name'] = getUserRole($user->role);
            $userDetails['phone'] = $user->phone;
            $userDetails['location'] = $user->location;
            $userDetails['preferred_job_type'] = $user->preferred_job_type;
            $userDetails['skills'] = $user->skills;
            $userDetails['resume_link'] = $user->resume_link;
            $userDetails['profile'] = $user->profile_path;
            $userDetails['cover_image'] = $user->cover_img_path;
            $userDetails['headline'] = $user->headline;
            $userDetails['status'] = $user->status;
            $userDetails['created_at'] = Displaydateformat($user->created_at);

            $success = [
                'userDetails' => $userDetails
            ];
            return $this->sendResponse($success, "User Details !");
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => $id], 401);
        }
    }
    public function profile(Request $request)
    {
        try {
            $user = $this->users->SelectOne(Auth::id());
            $userDetails = [];

            $userDetails['id'] = $user->id;
            $userDetails['enc_id'] = encryptId($user->id);
            $userDetails['name'] = $user->name;
            $userDetails['email'] = $user->email;
            $userDetails['role'] = $user->role;
            $userDetails['role_name'] = getUserRole($user->role);
            $userDetails['phone'] = $user->phone;
            $userDetails['location'] = $user->location;
            $userDetails['preferred_job_type'] = $user->preferred_job_type;
            $userDetails['skills'] = $user->skills;
            $userDetails['resume_link'] = $user->resume_link;
            $userDetails['profile'] = $user->profile_path;
            $userDetails['cover_image'] = $user->cover_img_path;
            $userDetails['headline'] = $user->headline;
            $userDetails['status'] = $user->status;
            $userDetails['created_at'] = Displaydateformat($user->created_at);

            $success = [
                'userDetails' => $userDetails
            ];
            return $this->sendResponse($success, "User Details !");
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => 'Unauthorised'], 401);
        }
    }

    public function users_exp(Request $request)
    {
        try {
            $id = decryptId($request->id);

            $experiences = $this->user_exp->SelectAll($id);

            $userExpDetails = $experiences->map(function ($exp) {
                return [
                    'id' => $exp->id,
                    'user_id' => $exp->user_id,
                    'company_name' => $exp->company_name,
                    'job_title' => $exp->job_title,
                    'description' => $exp->description,
                    'start_date' => Displaydateformat($exp->start_date),
                    'end_date' => Displaydateformat($exp->end_date),
                    'created_at' => $exp->created_at,
                ];
            });

            return $this->sendResponse(['userExpDetails' => $userExpDetails], "User Details!");
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => $ex->getMessage()], 401);
        }
    }

    public function changeCoverimage(Request $request)
    {

        try {
            $id = decryptId($request->id);

            $this->users->changeCoverimage($id);

            $success = [
                'message' => "User updated"
            ];
            return $this->sendResponse($success, "Cover Image Successfuly Changed!");
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => $ex], 401);
        }
    }

    public function changeProfileimage(Request $request)
    {

        try {
            $id = decryptId($request->id);

            $this->users->changeProfileimage($id);

            $success = [
                'message' => "User updated"
            ];
            return $this->sendResponse($success, "Cover Image Successfuly Changed!");
        } catch (Exception $ex) {
            return $this->sendError('Unauthorised.', ['error' => $ex], 401);
        }
    }

    public function userNameUnique(Request $request)
    {
        $id = $request->id;
        $userName = $request->username;

        if ($id != null || $id != "") {
            $exist = $this->users->UserNameExistCheck($id, $userName);
        } else {
            $exist = $this->users->UserNameCheck($userName);
        }

        $response = array(
            'existValue' => $exist ? false : true
        );

        return $this->sendResponse($response, "Unique Check!");
    }

    public function emailUnique(Request $request)
    {
        $id = $request->id;
        $email = $request->email;

        if ($id != null || $id != "") {
            $exist = $this->users->emailExistCheck($id, $email);
        } else {
            $exist = $this->users->emailCheck($email);
        }

        $response = array(
            'existValue' => $exist ? false : true
        );

        return $this->sendResponse($response, "Unique Check!");
    }


    public function storePublicKey(Request $request, $id)
    {
        $request->validate([
            'public_key' => 'required|string',
        ]);

        $user = User::findOrFail($id);
        $user->public_key = $request->public_key;
        $user->save();

        return response()->json(['success' => true, 'message' => 'Public key saved successfully.']);
    }

    public function getPublicKey($id)
    {
        $user = User::findOrFail($id);

        if (!$user->public_key) {
            return response()->json(['error' => 'Public key not found.'], 404);
        }

        return response()->json(['publicKey' => $user->public_key]);
    }
}
