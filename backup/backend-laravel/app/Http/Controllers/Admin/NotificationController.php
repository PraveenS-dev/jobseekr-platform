<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Models\Admin\Notification;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\BaseController;
use Carbon\Carbon;
use Exception;

class NotificationController extends BaseController
{
    private $notification;

    public function __construct()
    {
        $this->notification = new Notification();
    }

    public function store(Request $request)
    {
        $assigned_persons_id = $request->assigned_users;
        $title = $request->title;
        $message = $request->message;

        $this->notification->store($assigned_persons_id, $title, $message);

        Http::post(env('NODE_URL') . '/send-notification', [
            'sender_id' => (Auth::id()),
            'assign_person_ids' => $assigned_persons_id,
            'title' => $title,
            'message' => $message,
            'created_at' => Displaydateformat(Carbon::now()),
        ]);

        return response()->json(['success' => true]);
    }

    public function getNotification()
    {
        try {
            $data = $this->notification->getAllNotification();

            return $this->sendResponse($data, 'Notification data!');
        } catch (Exception $ex) {
            report($ex);
            return $this->sendError('Server Error.', ['error' => 'Something went wrong'], 500);
        }
    }

    public function getAllUnreadNotification()
    {
        try {
            $data = $this->notification->getAllUnreadNotification();

            return $this->sendResponse($data, 'Notification data!');
        } catch (Exception $ex) {
            report($ex);
            return $this->sendError('Server Error.', ['error' => 'Something went wrong'], 500);
        }
    }

    public function markAllRead(Request $request)
    {
        try {
            $id = $request->id;
            $data = $this->notification->markAllRead($id);

            return $this->sendResponse($data, 'Notification data!');
        } catch (Exception $ex) {
            report($ex);
            return $this->sendError('Server Error.', ['error' => 'Something went wrong'], 500);
        }
    }
}
