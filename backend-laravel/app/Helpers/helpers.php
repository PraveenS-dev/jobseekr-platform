<?php

use Carbon\Carbon;
use App\Models\User;
use App\Models\Admin\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Crypt;

if (!function_exists('encryptId')) {
    function encryptId($value)
    {
        $encrypt_method = "AES-256-CBC";
        $secret_key = env('ENCRYPTION_SECRET_KEY', 'SPK$0804r');
        $secret_iv  = env('ENCRYPTION_SECRET_IV', 'Spk$0804r');

        $key = hash('sha256', $secret_key);
        $iv = substr(hash('sha256', $secret_iv), 0, 16);

        $output = openssl_encrypt($value, $encrypt_method, $key, 0, $iv);
        return base64_encode($output);
    }
}

if (!function_exists('decryptId')) {
    function decryptId($encrypted)
    {
        if (is_numeric($encrypted)) {
            return (int) $encrypted;
        }

        $encrypt_method = "AES-256-CBC";
        $secret_key = env('ENCRYPTION_SECRET_KEY', 'SPK$0804r');
        $secret_iv  = env('ENCRYPTION_SECRET_IV', 'Spk$0804r');

        $key = hash('sha256', $secret_key);
        $iv = substr(hash('sha256', $secret_iv), 0, 16);

        try {
            $output = openssl_decrypt(base64_decode($encrypted), $encrypt_method, $key, 0, $iv);
            return $output ?: false;
        } catch (Exception $ex) {
            report($ex);
            return false;
        }
    }
}


if (!function_exists('getUsername')) {

    function getUsername($userid)
    {

        $user = DB::table('users')->select('name')->where('id', $userid)->where('trash', 'NO')->first();

        if ($user == null) {
            return '';
        } else {
            return $user->name;
        }
    }
}



if (!function_exists('DBdateformat')) {

    function DBdateformat($date)
    {

        return date('Y-m-d', strtotime($date));
    }
}

if (!function_exists('DBdatetimeformat')) {

    function DBdatetimeformat($date)
    {

        return date('Y-m-d H:i:s', strtotime($date));
    }
}

if (!function_exists('Displaydateformat')) {

    function Displaydateformat($date)
    {
        if ($date == '' || $date == null  || $date == '1970-01-01') {
            return "";
        } else {
            return date('d-m-Y', strtotime($date));
        }
    }
}

if (!function_exists('Displaytimeformat')) {

    function Displaytimeformat($date)
    {

        return date('H:i A', strtotime($date));
    }
}

if (!function_exists('datastringreplace')) {

    function datastringreplace($date)
    {

        return str_replace("/", "-", $date);
    }
}

if (!function_exists('Displaydatetimeformat')) {

    function Displaydatetimeformat($date)
    {

        return date('d-m-Y H:i:s', strtotime($date));
    }
}

if (!function_exists('todaydate')) {

    function todaydate()
    {

        return date('d-m-Y');
    }
}

if (!function_exists('currenttime')) {

    function currenttime()
    {

        return date('H:i A');
    }
}


if (!function_exists('todayDbdate')) {

    function todayDbdate()
    {

        return date('Y-m-d');
    }
}

if (!function_exists('todaydatetime')) {

    function todaydatetime()
    {

        return date('d-m-Y H:i:s');
    }
}

if (!function_exists('todayDBdatetime')) {

    function todayDBdatetime()
    {

        return date('Y-m-d H:i:s');
    }
}
if (!function_exists('getUserRole')) {

    function getUserRole($role)
    {

        switch ($role) {

            case '1':
                $role_name = "Jobseeker";
                break;
            case '2':
                $role_name = "Admin";
                break;
            case '3':
                $role_name = "Employer";
                break;
        }

        return $role_name;
    }
}

// if (!function_exists('CheckUserRole')) {

//     function CheckUserRole($roleId)
//     {

//         $user =  User::find(Auth::id());

//         $userroleid = string_to_array($user->role);

//         $roleids = UserRole::whereIn('id', $userroleid)->pluck('id')->toArray();

//         if (in_array($roleId, $roleids)) {
//             return TRUE;
//         } else {
//             return FALSE;
//         }
//     }
// }

if (!function_exists('notificationSave')) {
    function notificationSave($data)
    {
        $data['sender_id'] = Auth::id();
        $data['created_by'] = Auth::id();

        $notification = Notification::create($data);

        $assigned_persons_id = $data['assign_person_ids'] ?? [];
        $title = $data['title'] ?? '';
        $message = $data['message'] ?? '';
        $url = $data['url'] ?? '';

        $response = Http::asForm()->post(env('NODE_URL') . '/send-notification', [
            'id' => $notification->id,
            'sender_id' => Auth::id(),
            'assign_person_ids' => $assigned_persons_id,
            'title' => $title,
            'message' => $message,
            'url' => $url,
            'created_at' => now()->toISOString(),
        ]);
    }
}
