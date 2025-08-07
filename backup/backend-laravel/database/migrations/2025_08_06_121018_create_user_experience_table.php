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
        Schema::create('user_experience', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('user_id');
            $table->string('company_name')->nullable();
            $table->string('job_title')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('description')->nullable();
            $table->integer('created_by');
            $table->integer('updated_by')->nullable();
            $table->dateTime('created_at')->nullable()->useCurrent();
            $table->dateTime('updated_at')->useCurrentOnUpdate()->nullable()->useCurrent();
            $table->integer('status')->nullable()->default(1);
            $table->enum('trash', ['NO', 'YES'])->nullable()->default('NO');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_experience');
    }
};
