{{- define "revision-tracker.fullname" -}}
{{- printf "%s-revision-tracker" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "revision-tracker.labels" -}}
app.kubernetes.io/name: revision-tracker
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

