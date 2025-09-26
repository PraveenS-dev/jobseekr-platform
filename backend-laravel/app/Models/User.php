<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Scopes\TrashScope;
use Illuminate\Support\Facades\File;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Storage;

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

        $disk = env('FILESYSTEM_DISK', 'public');
        $upload_path = 'uploads/users/resume';

        if ($request->hasFile('resume')) {
            $file = $request->file('resume');
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

            if ($user->resume_link) {
                try {
                    $oldFile = $disk === 's3'
                        ? parse_url($user->resume_link, PHP_URL_PATH)
                        : str_replace(asset('storage') . '/', '', $user->resume_link);

                    Storage::disk($disk)->delete(ltrim($oldFile, '/'));
                } catch (\Exception $e) {
                }
            }

            $path = $file->storeAs($upload_path, $filename, [
                'disk' => $disk,
                'visibility' => $disk === 's3' ? 'public' : null,
            ]);

            $resume_link = $disk === 's3'
                ? Storage::disk('s3')->url($path)
                : asset('storage/' . $path);
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

        $disk = env('FILESYSTEM_DISK', 'public');
        $upload_path = 'uploads/users/cover_images';

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

            if ($user->cover_img_path) {
                try {
                    $oldFile = $disk === 's3'
                        ? parse_url($user->cover_img_path, PHP_URL_PATH)
                        : str_replace(asset('storage') . '/', '', $user->cover_img_path);

                    Storage::disk($disk)->delete(ltrim($oldFile, '/'));
                } catch (\Exception $e) {
                }
            }

            $path = $file->storeAs($upload_path, $filename, [
                'disk' => $disk,
                'visibility' => $disk === 's3' ? 'public' : null,
            ]);

            $cover_img_path = $disk === 's3'
                ? Storage::disk('s3')->url($path)
                : asset('storage/' . $path);
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

        $disk = env('FILESYSTEM_DISK', 'public');
        $upload_path = 'uploads/users/profile_images';

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

            if ($user->profile_path) {
                try {
                    $oldFile = $disk === 's3'
                        ? parse_url($user->profile_path, PHP_URL_PATH) // extract path from S3 URL
                        : str_replace(asset('storage') . '/', '', $user->profile_path);

                    Storage::disk($disk)->delete(ltrim($oldFile, '/'));
                } catch (\Exception $e) {
                }
            }

            $path = $file->storeAs($upload_path, $filename, [
                'disk' => $disk,
                'visibility' => $disk === 's3' ? 'public' : null,
            ]);

            $profile_path = $disk === 's3'
                ? Storage::disk('s3')->url($path)
                : asset('storage/' . $path);
        } else {
            $profile_path = $user->profile_path;
        }

        $user->update([
            'profile_path' => $profile_path,
        ]);

        return true;
    }

    public function changeCoverimageMobile($id)
    {
        $request = request();
        $user = User::findOrFail($id);

        $disk = env('FILESYSTEM_DISK', 'public');
        $upload_path = 'uploads/users/cover_images';

        if ($request->image) {
            $base64Image = $request->image;
            $data = preg_replace('#^data:[a-z]+/[a-z0-9-]+;base64,#i', '', $base64Image);
            $fileData = base64_decode($data);

            $finfo = finfo_open();
            $mimeType = finfo_buffer($finfo, $fileData, FILEINFO_MIME_TYPE);
            finfo_close($finfo);

            $validFormats = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/heic',
                'image/heif',
            ];

            if (!in_array($mimeType, $validFormats)) {
                return response()->json(['error' => 'Invalid file format'], 422);
            }

            $mimetypes = [
                'image/jpeg' => 'jpeg',
                'image/jpg'  => 'jpg',
                'image/png'  => 'png',
                'image/heic' => 'heic',
                'image/heif' => 'heif',
            ];

            $extension = $mimetypes[$mimeType];
            $filename = uniqid() . '_' . time() . '.' . $extension;
            $path = $upload_path . '/' . $filename;

            if ($user->cover_img_path) {
                try {
                    $oldFile = $disk === 's3'
                        ? ltrim(parse_url($user->cover_img_path, PHP_URL_PATH), '/')
                        : str_replace(asset('storage') . '/', '', $user->cover_img_path);

                    Storage::disk($disk)->delete($oldFile);
                } catch (\Exception $e) {
                }
            }

            Storage::disk($disk)->put($path, $fileData, $disk === 's3' ? 'public' : null);

            $cover_img_path = $disk === 's3'
                ? Storage::disk('s3')->url($path)
                : asset('storage/' . $path);
        } else {
            $cover_img_path = $user->cover_img_path;
        }

        $user->update([
            'cover_img_path' => $cover_img_path,
        ]);

        return response()->json([
            'success' => true,
            'cover_img_path' => $cover_img_path,
        ]);
    }

    public function changeProfileimageMobile($id)
    {
        $request = request();
        $user = User::findOrFail($id);

        $disk = env('FILESYSTEM_DISK', 'public');
        $upload_path = 'uploads/users/profile_images';

        if ($request->image) {
            $base64Image = $request->image;
            $data = preg_replace('#^data:[a-z]+/[a-z0-9-]+;base64,#i', '', $base64Image);
            $fileData = base64_decode($data);

            $finfo = finfo_open();
            $mimeType = finfo_buffer($finfo, $fileData, FILEINFO_MIME_TYPE);
            finfo_close($finfo);

            $validFormats = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/heic',
                'image/heif',
            ];

            if (!in_array($mimeType, $validFormats)) {
                return response()->json(['error' => 'Invalid file format'], 422);
            }

            $mimetypes = [
                'image/jpeg' => 'jpeg',
                'image/jpg'  => 'jpg',
                'image/png'  => 'png',
                'image/heic' => 'heic',
                'image/heif' => 'heif',
            ];

            $extension = $mimetypes[$mimeType];
            $filename = uniqid() . '_' . time() . '.' . $extension;
            $path = $upload_path . '/' . $filename;

            if ($user->profile_path) {
                try {
                    $oldFile = $disk === 's3'
                        ? ltrim(parse_url($user->profile_path, PHP_URL_PATH), '/')
                        : str_replace(asset('storage') . '/', '', $user->profile_path);

                    Storage::disk($disk)->delete($oldFile);
                } catch (\Exception $e) {
                }
            }

            Storage::disk($disk)->put($path, $fileData, $disk === 's3' ? 'public' : null);

            $profile_path = $disk === 's3'
                ? Storage::disk('s3')->url($path)
                : asset('storage/' . $path);
        } else {
            $profile_path = $user->profile_path;
        }

        $user->update([
            'profile_path' => $profile_path,
        ]);

        return response()->json([
            'success' => true,
            'profile_path' => $profile_path,
        ]);
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
