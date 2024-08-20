"""OCMovies-API URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from api import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/genres/", include("api.v1.genres.urls")),
    path("api/v1/titles/", include("api.v1.titles.urls")),
    path("", views.index, name="index"),  # Ajoutez ce chemin pour la page d'accueil
]
