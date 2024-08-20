from django.shortcuts import render


def index(request):
    return render(
        request, "index.html"
    )  # Assurez-vous que le fichier index.html existe dans votre dossier templates
