<?php

namespace App\Models\Admin;

use App\Scopes\TrashScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;

class Notification extends Model
{
    use  HasFactory;

    protected $table = 'notifications';
    protected $primaryKey = 'id';

    protected $fillable = [
        'sender_id',
        'assign_person_ids',
        'title',
        'message',
        'is_read',
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

    public function store($assigned_persons_id, $title, $message)
    {
        $insert_array = array(
            'sender_id' => Auth::id(),
            'assign_person_ids' => $assigned_persons_id,
            'title' => $title,
            'message' => $message,
            'created_by' => Auth::id(),
        );

        return $this->create($insert_array);
    }

    public function markAllRead($id = null)
    {
        $query = $this->where('assign_person_ids', Auth::id());

        if ($id != null) {
            $query->where('id', $id);
        }

        return $query->update(['is_read' => 1]);
    }


    public function getAllNotification()
    {
        return $this->where('assign_person_ids', Auth::id())->get();
    }

    public function getAllUnreadNotification()
    {
        return $this->where('assign_person_ids', Auth::id())->where('is_read', 0)->get();
    }


    protected static function booted()
    {
        static::addGlobalScope(new TrashScope('notifications'));
    }
}
