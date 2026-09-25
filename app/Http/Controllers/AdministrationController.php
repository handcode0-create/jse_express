<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class AdministrationController extends Controller
{
    public function tableauDeBord(): Response
    {
        return Inertia::render('Admin/TableauDeBord');
    }
}
