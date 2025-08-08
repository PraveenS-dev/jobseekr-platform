<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Scopes\TrashScope;
use Illuminate\Support\Facades\File;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */


    protected $table = 'users';
    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'email',
        'headline',
        'comp_id',
        'role',
        'phone',
        'location',
        'resume_link',
        'skills',
        'preferred_job_type',
        'profile_path',
        'cover_img_path',
        'username',
        'password',
        'public_key',
        'status',
        'trash',
        'created_by',
        'update_by',
        'created_at',
        'created_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function statuschange($id)
    {
        $request = request();

        $type = $request->types;
        if ($type == 1) {
            $update_data = array(
                'status' => 0,
            );
        } else {
            $update_data = array(
                'status' => 1,
            );
        }

        return $this->where('id', $id)->update($update_data);
    }

    public function deleteUser($id)
    {

        $update_data = array(
            'status' => 0,
            'trash' => "YES",
        );

        return $this->where('id', $id)->update($update_data);
    }

    public function updateUser($id)
    {
        $request = request();

        $user = User::findOrFail($id);

        if ($request->hasFile('resume')) {

            $upload_path = 'uploads/users/resume/';
            $disk = 'public';

            $file = $request->file('resume');
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

            $directory = storage_path('app/public/' . $upload_path);
            if (!File::exists($directory)) {
                File::makeDirectory($directory, 0755, true);
            }

            $file->storeAs($upload_path, $filename, $disk);

            $resume_link = asset('storage/' . $upload_path . $filename);
        } else {
            $resume_link = $user->resume_link;
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'headline' => $request->headline,
            'phone' => $request->phone,
            'location' => $request->location,
            'resume_link' => $resume_link,
            'status' => $request->profile_status,
            'skills' => $request->skills,
            'preferred_job_type' => $request->preferred_job_type,
        ]);

        return true;
    }

    public function changeCoverimage($id)
    {
        $request = request();

        $user = User::findOrFail($id);

        if ($request->hasFile('image')) {

            $upload_path = 'uploads/users/cover_images/';
            $disk = 'public';

            $file = $request->file('image');
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

            $directory = storage_path('app/public/' . $upload_path);
            if (!File::exists($directory)) {
                File::makeDirectory($directory, 0755, true);
            }

            $file->storeAs($upload_path, $filename, $disk);

            $cover_img_path = asset('storage/' . $upload_path . $filename);
        } else {
            $cover_img_path = $user->cover_img_path;
        }

        $user->update([
            'cover_img_path' => $cover_img_path,
        ]);

        return true;
    }

    public function changeProfileimage($id)
    {
        $request = request();

        $user = User::findOrFail($id);

        if ($request->hasFile('image')) {

            $upload_path = 'uploads/users/profile_images/';
            $disk = 'public';

            $file = $request->file('image');
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

            $directory = storage_path('app/public/' . $upload_path);
            if (!File::exists($directory)) {
                File::makeDirectory($directory, 0755, true);
            }

            $file->storeAs($upload_path, $filename, $disk);

            $profile_path = asset('storage/' . $upload_path . $filename);
        } else {
            $profile_path = $user->profile_path;
        }

        $user->update([
            'profile_path' => $profile_path,
        ]);

        return true;
    }



    public function SelectOne($id)
    {

        $data = $this->where('id', $id)->first();

        return $data;
    }

    public function UserNameExistCheck($id, $userName)
    {

        $data = $this->where('id', '!=', $id)->where('username', $userName)->count();

        return $data;
    }

    public function UserNameCheck($userName)
    {

        $data = $this->where('username', $userName)->count();

        return $data;
    }

    public function emailExistCheck($id, $email)
    {

        $data = $this->where('id', '!=', $id)->where('email', $email)->count();

        return $data;
    }

    public function emailCheck($email)
    {

        $data = $this->where('email', $email)->count();

        return $data;
    }

    protected static function booted()
    {
        static::addGlobalScope(new TrashScope('users'));
    }
}
