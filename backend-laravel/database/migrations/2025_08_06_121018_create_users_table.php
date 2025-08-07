<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('username');
            $table->string('email')->unique();
            $table->text('headline')->nullable();
            $table->string('comp_id')->nullable();
            $table->string('preferred_job_type', 100)->nullable();
            $table->text('skills')->nullable();
            $table->string('resume_link')->nullable();
            $table->string('location')->nullable();
            $table->string('phone', 100)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->text('public_key')->nullable();
            $table->rememberToken();
            $table->integer('role')->default(1)->comment('1=> jobseeker
2=> admin
3=> employer');
            $table->string('profile_path')->nullable();
            $table->string('cover_img_path')->nullable();
            $table->integer('status')->default(1);
            $table->enum('trash', ['YES', 'NO'])->default('NO');
            $table->integer('created_by');
            $table->integer('update_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
