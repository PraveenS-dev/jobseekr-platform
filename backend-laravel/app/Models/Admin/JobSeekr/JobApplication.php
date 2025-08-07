<?php

namespace App\Models\Admin\JobSeekr;

use App\Scopes\TrashScope;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Tymon\JWTAuth\Http\Parser\AuthHeaders;

class JobApplication extends Model
{
    use  HasFactory;

    protected $table = 'jobseekr_job_applications';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'job_id',
        'resume_path',
        'application_status',
        'created_by',
        'updated_by',
        'status',
        'trash',
        'created_at',
        'updated_at'
    ];

    protected $attributes = [
        'status' => 1,
        'trash' => 'NO',
    ];

    public function apply($job_id)
    {
        $request = request();

        $upload_path = 'uploads/resume';
        $disk = 'public';
        $file_path = '';

        if ($request->hasFile('resume')) {

            $resume = $request->resume;

            if ($resume->isValid()) {
                $file_name = time() . Str::random(10) . '.' . $resume->getClientOriginalExtension();
                $file_path = $resume->storeAs($upload_path, $file_name, $disk);
                $file_path = asset('storage/' . $file_path);
            }
        } else {
            $file_path = Auth::user()->resume_link;
        }

        $insertArray = array(
            'user_id' => Auth::id(),
            'job_id' => $job_id,
            'application_status' => JOB_APPLICATION_PENDING,
            'resume_path' => $file_path,
            'created_by' => Auth::id(),
        );

     

        return $this->create($insertArray);
    }

    public function selectOne($id)
    {
        $data = $this->where('id', $id)->first();

        return $data;
    }

    public function checkJobApplication($id)
    {
        $data = $this->where('job_id', $id)->where('user_id', Auth::id())->count();

        return $data;
    }

    public function getApplicationBasedonJobs($id)
    {
        $data = $this->where('job_id', $id)->get();

        return $data;
    }
    public function applicationViewed($id)
    {
        $insertArray = array(
            'application_status' => JOB_APPLICATION_VIEWED,
        );

        $this->where('id', $id)->update($insertArray);

        return true;
    }
    public function resumeViewed($id)
    {
        $insertArray = array(
            'application_status' => JOB_APPLICATION_RESUME_VIEWED,
        );

        $this->where('id', $id)->update($insertArray);

        return true;
    }
    public function approval($id, $status)
    {
        $insertArray = array(
            'application_status' => $status,
        );

        $this->where('id', $id)->update($insertArray);

        return true;
    }

    protected static function booted()
    {
        static::addGlobalScope(new TrashScope('jobseekr_job_applications'));
    }
}
