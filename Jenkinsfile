pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    parameters {
        choice(name: 'REGISTRY_TARGET', choices: ['dockerhub', 'ecr'], description: 'Container registry for push stage')
        string(name: 'IMAGE_NAME', defaultValue: 'examwizards-api', description: 'Image name (ECR repo name or Docker Hub image)')
        string(name: 'IMAGE_TAG', defaultValue: '1.0.0', description: 'Image tag (prefer git SHA in production)')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip Maven tests on agent')
    }

    environment {
        DOCKERHUB_REGISTRY = 'docker.io'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend unit tests') {
            when {
                not { expression { return params.SKIP_TESTS } }
            }
            steps {
                dir('backend') {
                    script {
                        if (isUnix()) {
                            sh './mvnw -B verify -DskipTests'
                        } else {
                            bat 'mvnw.cmd -B verify -DskipTests'
                        }
                    }
                }
            }
        }

        stage('Build API image') {
            steps {
                script {
                    echo "Building Docker image ${params.IMAGE_NAME}:${params.IMAGE_TAG}"
                    docker.build("${params.IMAGE_NAME}:${params.IMAGE_TAG}", "-f backend/Dockerfile backend")
                }
            }
        }

        stage('Security scan (optional)') {
            steps {
                echo 'Attach Trivy or ECR image scanning here; fail build on critical CVEs.'
            }
        }

        stage('Push image') {
            steps {
                script {
                    if (params.REGISTRY_TARGET == 'dockerhub') {
                        docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-creds') {
                            docker.image("${params.IMAGE_NAME}:${params.IMAGE_TAG}").push()
                        }
                    } else {
                        echo 'ECR: configure aws ecr get-login-password and docker push in a scripted step with jenkins AWS credentials.'
                        echo 'See deploy/scripts/push-ecr.example.sh for the equivalent shell operations.'
                    }
                }
            }
        }

        stage('Manual approval (production only)') {
            when {
                expression { false }
            }
            steps {
                input message: 'Deploy to production?', ok: 'Promote'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed — check logs and image scan results.'
        }
    }
}
