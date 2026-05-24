<?php

namespace App\Controllers;

use App\Models\Modalidades;
use App\Models\Sorteios;
use App\Models\SorteiosAgenda;
use App\Models\LogsConcurso;
use Carbon\Carbon;
use DateTime;
use Ramsey\Uuid\Uuid;

class ScheduleConcursoController
{
    private $mapDias = [
        'SEG' => 1,
        'TER' => 2,
        'QUA' => 3,
        'QUI' => 4,
        'SEX' => 5,
        'SAB' => 6,
        'DOM' => 7,
    ];

    public function scheduleNextConcurse($modalidade_id)
    {
        $scheduleHours = SorteiosAgenda::where('modalidade_id', $modalidade_id)->first();
        if (!$scheduleHours) {
            return;
        }

        $jsonDate = json_decode($scheduleHours->dias_agendados);
        if (!$jsonDate) return;

        $nextDate = $this->getNextDate($jsonDate);
        if (!$nextDate) return;

        $modalidade = Modalidades::where('id', $modalidade_id)
            ->where('ativo', '1')
            ->first();

        if (!$modalidade) return;

        $banca_id = $modalidade->id_banca;

        $verifyDate = Sorteios::where('modalidade_id', $modalidade_id)
            ->where('data_sorteio', $nextDate)
            ->first();

        // If no draw is scheduled
        if (!$verifyDate) {
            $lastConcurse = Sorteios::where('modalidade_id', $modalidade_id)->orderBy('id', 'desc')->first();
            
            $concursoData = [
                'uuid' => Uuid::uuid4(),
                'banca_id' => $banca_id,
                'modalidade_id' => $modalidade_id,
                'status' => 'pending',
                'inicio_venda_imediato' => 1,
                'data_sorteio' => $nextDate,
                'is_auto_criado' => 1,
                'data_limite_apostas' => $nextDate,
                'data_limite_exclusao_apostas' => $nextDate,
            ];

            if ($lastConcurse) {
                // If it is numeric, increment it, else try standard increment logic
                if (is_numeric($lastConcurse->concurso)) {
                    $concursoData['concurso'] = intval($lastConcurse->concurso) + 1;
                } else {
                    $concursoData['concurso'] = $this->incrementConcurso($lastConcurse->concurso);
                }
            } else {
                $concursoData['concurso'] = 1;
            }

            $concurso = Sorteios::create($concursoData);

            if ($concurso) {
                $createdData = Sorteios::find($concurso->id);
                
                LogsConcurso::create([
                    'sorteio_id' => $concurso->id,
                    'titulo' => 'Criação Automática de Concurso (Agenda)',
                    'detalhes' => $createdData->toArray(),
                    'date_created' => Carbon::now()
                ]);
            }
        }
    }

    private function getNextDate($horarios)
    {
        $agora = new DateTime();
        $proximaData = null;

        foreach ($horarios as $item) {
            if (!isset($item->active) || !$item->active) {
                continue;
            }

            $diaSemana = $this->mapDias[$item->dia] ?? null;
            if (!$diaSemana) continue;
            
            [$hora, $minuto] = explode(':', $item->hora);

            $data = clone $agora;

            $data->setTime($hora, $minuto);
            $data->modify('this week');
            $data->modify(($diaSemana - $data->format('N')) . ' days');

            if ($data <= $agora) {
                $data->modify('+1 week');
            }

            if ($proximaData === null || $data < $proximaData) {
                $proximaData = $data;
            }
        }

        if (!$proximaData) return null;

        return $proximaData->format('Y-m-d H:i:s');
    }

    private function incrementConcurso($concurso)
    {
        if (preg_match('/^(.*?)(\d+)([^\d]*)$/', $concurso, $matches)) {
            $prefix = $matches[1];
            $numberStr = $matches[2];
            $suffix = $matches[3];

            $newNumber = str_pad(intval($numberStr) + 1, strlen($numberStr), '0', STR_PAD_LEFT);
            return $prefix . $newNumber . $suffix;
        }

        return $concurso . '1';
    }
}
