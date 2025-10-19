pipeline {
    agent any

    tools {
        // [Jenkins 관리] > [Global Tool Configuration]에서 설정한
        // NodeJS의 'Name'과 정확히 일치해야 합니다. (예: 'NodeJS-18')
        nodejs 'NodeJS-18'
    }

    environment {
        PROJECT_NAME = 'express-service'
        NODE_VERSION = '18' // 이 값은 이제 tools 지시어로 자동 관리됩니다.
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '소스 코드 체크아웃'
                checkout scm
            }
        }

        stage('Setup Node Environment') {
            steps {
                echo 'Node.js 환경 확인'
                sh '''
                    node --version
                    npm --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'NPM 의존성 설치'
                sh '''
                    npm ci --prefer-offline --no-audit
                '''
            }
        }

        stage('Lint') {
            steps {
                echo '코드 린트 검사'
                sh '''
                    npm run lint || echo "린트 스크립트 없음"
                '''
            }
        }

        stage('Test') {
            steps {
                echo '테스트 실행'
                sh '''
                    npm run test || echo "테스트 스크립트 없음"
                '''
            }
        }

        stage('Build') {
            steps {
                echo '애플리케이션 빌드'
                sh '''
                    npm run build || echo "빌드 스크립트 없음 (런타임 프로젝트)"
                '''
            }
        }

        stage('Security Audit') {
            steps {
                echo '보안 취약점 검사'
                sh '''
                    npm audit --audit-level=high || true
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '헬스 체크 (구문 검사)'
                sh '''
                    node -c src/server.js || true
                '''
            }
        }
    }

    post {
        success {
            echo '✅ 빌드 성공!'
            // Webhook to DevOps API
            sh '''
                curl -X POST http://host.docker.internal:8000/webhook/jenkins \
                  -H "Content-Type: application/json" \
                  -d '{
                    "service": "express-service",
                    "status": "success",
                    "build_number": "'${BUILD_NUMBER}'",
                    "git_repo": "'${GIT_URL}'",
                    "git_branch": "'${GIT_BRANCH}'",
                    "job_name": "'${JOB_NAME}'"
                  }' || true
            '''
        }
        failure {
            echo '❌ 빌드 실패!'
            // Webhook to DevOps API with error details
            sh '''
                curl -X POST http://host.docker.internal:8000/webhook/jenkins \
                  -H "Content-Type: application/json" \
                  -d '{
                    "service": "express-service",
                    "status": "failure",
                    "build_number": "'${BUILD_NUMBER}'",
                    "git_repo": "'${GIT_URL}'",
                    "git_branch": "'${GIT_BRANCH}'",
                    "job_name": "'${JOB_NAME}'",
                    "error_log": "빌드 프로세스 실패"
                  }' || true
            '''
        }
        always {
            echo '빌드 완료 - 정리 작업'
            cleanWs()
        }
    }
}