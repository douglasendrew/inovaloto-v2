<?php

namespace App\Models;

class InvoiceItem extends BaseTenantModel
{
    protected $fillable = [
        'invoice_id',
        'aposta_id',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function aposta()
    {
        return $this->belongsTo(SorteiosApostas::class, 'aposta_id');
    }
}
