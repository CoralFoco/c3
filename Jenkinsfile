pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        git(url: 'git@github.com:paulomenezes/c3.git', branch: 'master')
      }
    }
    stage('error') {
      steps {
        sh 'npm install'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
  }
}