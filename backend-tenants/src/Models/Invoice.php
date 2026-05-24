<?php

namespace App\Models;

use Illuminate\Support\Str;

class Invoice extends BaseTenantModel
{
    protected $fillable = [
        'uuid',
        'pid',
        'user_id',
        'amount',
        'status',
        'zettpay_id',
        'pix_qr_code',
        'pix_copy_paste',
        'reference_date',
        'paid_at',
        'payment_method',
        'proof_path',
        'admin_notes',
    ];

    protected $casts = [
        'reference_date' => 'date',
        'paid_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function ($invoice) {
            if (empty($invoice->pid)) {
                $invoice->pid = Str::random(16);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
